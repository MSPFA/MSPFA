import './styles.module.scss';
import Link from 'components/Link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const flashyTitleColors = [
	'#de3535',
	'#dd8137',
	'#f3ff5b',
	'#63d606',
	'#4193c4',
	'#953ddb'
];

/** Returns a random item of `flashyTitleColors`. */
const getFlashyTitleColor = () => flashyTitleColors[Math.floor(Math.random() * flashyTitleColors.length)];

const FlashyTitle = () => {
	const router = useRouter();
	const [color, setColor] = useState(getFlashyTitleColor);

	useEffect(() => (
		() => {
			setColor(getFlashyTitleColor());
		}
	), [router.asPath]);

	return (
		<div id="flashy-title-container" className="front">
			<style jsx global>
				{`
					#flashy-title {
						background-color: ${color};
					}
				`}
			</style>
			<Link
				id="flashy-title"
				href="/"
				title="MSPFA Home"
				tabIndex={-1}
				draggable={false}
			/>
		</div>
	);
};

export default FlashyTitle;