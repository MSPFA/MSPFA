import './styles.module.scss';
import type { ReactElement } from 'react';
import React, { useRef, useMemo } from 'react';
import BBToolbarButton from 'components/BBToolbar/BBToolbarButton';
import BBCode from 'components/BBCode';
import Spoiler from 'components/Spoiler';

export type TextAreaRef = React.MutableRefObject<HTMLTextAreaElement>;

export const TextAreaRefContext = React.createContext<{
	textAreaRef: TextAreaRef,
	setValue: BBToolbarProps['setValue']
}>(undefined!);

export type BBToolbarProps = {
	/** The current value of the text area. */
	value: string,
	/** A function which sets the value of the text area. */
	setValue: (value: string) => void,
	/** The component to pass a `textarea` ref to. */
	children: ReactElement<{
		innerRef: TextAreaRef
	}>
};

/** Gives the child text area a BBCode toolbar. */
const BBToolbar = ({ value, setValue, children }: BBToolbarProps) => {
	const textAreaRef = useRef<HTMLTextAreaElement>(null!);

	return (
		<TextAreaRefContext.Provider
			value={
				useMemo(() => ({
					textAreaRef,
					setValue
				}), [textAreaRef, setValue])
			}
		>
			<div className="bb-toolbar">
				<span className="bb-toolbar-group">
					<BBToolbarButton tag="b" />
					<BBToolbarButton tag="i" />
					<BBToolbarButton tag="u" />
					<BBToolbarButton tag="s" />
				</span>
				<span className="bb-toolbar-group">
					<BBToolbarButton tag="color" />
					<BBToolbarButton tag="background" />
				</span>
				<span className="bb-toolbar-group">
					<BBToolbarButton tag="size" />
					<BBToolbarButton tag="font" />
				</span>
				<span className="bb-toolbar-group">
					<BBToolbarButton tag="left" />
					<BBToolbarButton tag="center" />
					<BBToolbarButton tag="right" />
					<BBToolbarButton tag="justify" />
				</span>
				<span className="bb-toolbar-group">
					<BBToolbarButton tag="url" />
					<BBToolbarButton tag="img" />
					<BBToolbarButton tag="alt" />
					<BBToolbarButton tag="spoiler" />
					<BBToolbarButton tag="chat" />
					<BBToolbarButton tag="youtube" />
				</span>
			</div>
			{React.cloneElement(children, {
				innerRef: textAreaRef
			})}
			<Spoiler open="Show Preview" close="Hide Preview">
				<BBCode html>{value}</BBCode>
			</Spoiler>
		</TextAreaRefContext.Provider>
	);
};

export default BBToolbar;