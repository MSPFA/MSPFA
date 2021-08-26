import './styles.module.scss';
import BBField from 'components/BBCode/BBField';
import Button from 'components/Button';
import Label from 'components/Label';
import NewsPost from 'components/NewsPost';
import Row from 'components/Row';
import { StoryViewerContext } from 'components/StoryViewer';
import type { APIClient } from 'lib/client/api';
import api from 'lib/client/api';
import Dialog from 'lib/client/Dialog';
import frameThrottler from 'lib/client/frameThrottler';
import IDPrefix from 'lib/client/IDPrefix';
import type { ClientNews } from 'lib/client/news';
import { Perm } from 'lib/client/perms';
import useFunction from 'lib/client/useFunction';
import { useUserCache } from 'lib/client/UserCache';
import { useUser } from 'lib/client/users';
import { addViewportListener, removeViewportListener } from 'lib/client/viewportListener';
import React, { useContext, useEffect, useRef, useState } from 'react';

type StoryNewsAPI = APIClient<typeof import('pages/api/stories/[storyID]/news').default>;

/** The maximum number of news posts to request each time. */
export const NEWS_POSTS_PER_REQUEST = 3;

const StoryNews = React.memo(() => {
	const {
		story,
		newsPosts: initialNewsPosts
	} = useContext(StoryViewerContext)!;

	const { cacheUser } = useUserCache();

	const user = useUser();

	const [newsPosts, setNewsPosts] = useState(initialNewsPosts);

	const createNewsPost = useFunction(async () => {
		const dialog = new Dialog({
			id: 'edit-news',
			title: 'Create News Post',
			initialValues: {
				content: ''
			},
			content: (
				<IDPrefix.Provider value="news">
					<Row>
						<Label block htmlFor="news-field-content">
							Content
						</Label>
						<BBField
							name="content"
							autoFocus
							required
							maxLength={20000}
							rows={6}
						/>
					</Row>
					<Row id="edit-news-tip">
						The recommended image width in a news post is 420 pixels.
					</Row>
				</IDPrefix.Provider>
			),
			actions: [
				{ label: 'Submit!', autoFocus: false },
				{ label: 'Cancel' }
			]
		});

		if (!(await dialog)?.submit) {
			return;
		}

		const { data: newsPost } = await (api as StoryNewsAPI).post(
			`/stories/${story.id}/news`,
			dialog.form!.values
		);

		setNewsPosts(newsPosts => [
			newsPost,
			...newsPosts
		]);
	});

	const [notAllNewsLoaded, setNotAllNewsLoaded] = useState(
		// If the client initially received the maximum amount of news posts, then there may be more. On the other hand, if they received less, then we know we have all of them.
		initialNewsPosts.length === NEWS_POSTS_PER_REQUEST
	);
	/** Whether news is currently being requested. */
	const newsLoadingRef = useRef(false);
	const newsElementRef = useRef<HTMLDivElement>(null);

	const checkIfNewsShouldBeFetched = useFunction(async () => {
		if (newsLoadingRef.current) {
			return;
		}

		const newsRect = newsElementRef.current!.getBoundingClientRect();
		const newsStyle = window.getComputedStyle(newsElementRef.current!);
		const newsPaddingBottom = +newsStyle.paddingBottom.slice(0, -2);
		const newsContentBottom = newsRect.bottom - newsPaddingBottom;

		// Check if the user has scrolled below the bottom of the news's content.
		if (newsContentBottom < document.documentElement.clientHeight) {
			newsLoadingRef.current = true;

			// Fetch more news.
			const { data: { news, userCache } } = await (api as StoryNewsAPI).get(`/stories/${story.id}/news`, {
				params: {
					limit: NEWS_POSTS_PER_REQUEST,
					...newsPosts.length && {
						before: newsPosts[newsPosts.length - 1].id
					}
				}
			}).finally(() => {
				newsLoadingRef.current = false;
			});

			if (news.length < NEWS_POSTS_PER_REQUEST) {
				setNotAllNewsLoaded(false);
			}

			if (news.length === 0) {
				return;
			}

			userCache.forEach(cacheUser);

			setNewsPosts(newsPosts => [
				...newsPosts,
				...news
			]);
		}
	});

	useEffect(() => {
		if (notAllNewsLoaded) {
			const _viewportListener = addViewportListener(checkIfNewsShouldBeFetched);
			frameThrottler(_viewportListener).then(checkIfNewsShouldBeFetched);

			return () => {
				removeViewportListener(_viewportListener);
			};
		}

		// `newsPosts` must be a dependency here so that updating it calls `checkIfNewsShouldBeFetched` again without needing to change the viewport.
	}, [checkIfNewsShouldBeFetched, notAllNewsLoaded, newsPosts]);

	const deleteNewsPost = useFunction((newsID: string) => {
		setNewsPosts(newsPosts => {
			const newsIndex = newsPosts.findIndex(({ id }) => id === newsID);

			return [
				...newsPosts.slice(0, newsIndex),
				...newsPosts.slice(newsIndex + 1, newsPosts.length)
			];
		});
	});

	const setNewsPost = useFunction((newsPost: ClientNews) => {
		setNewsPosts(newsPosts => {
			const newsIndex = newsPosts.findIndex(({ id }) => id === newsPost.id);

			return [
				...newsPosts.slice(0, newsIndex),
				newsPost,
				...newsPosts.slice(newsIndex + 1, newsPosts.length)
			];
		});
	});

	return (
		<>
			{user && (
				story.owner === user.id
				|| story.editors.includes(user.id)
				|| !!(user.perms & Perm.sudoWrite)
			) && (
				<Row className="story-news-actions">
					<Button
						className="small"
						onClick={createNewsPost}
					>
						Create News Post
					</Button>
				</Row>
			)}
			<Row
				className="story-news"
				ref={newsElementRef}
			>
				{newsPosts.map(newsPost => (
					<NewsPost
						key={newsPost.id}
						story={story}
						setNewsPost={setNewsPost}
						deleteNewsPost={deleteNewsPost}
					>
						{newsPost}
					</NewsPost>
				))}
			</Row>
		</>
	);
});

export default StoryNews;