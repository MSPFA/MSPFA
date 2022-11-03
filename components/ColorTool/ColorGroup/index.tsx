import './styles.module.scss';
import type { ClientColor, ClientColorGroup } from 'lib/client/colors';
import React, { useContext } from 'react';
import PrivateStoryContext from 'lib/client/reactContexts/PrivateStoryContext';
import Label from 'components/Label';
import LabeledGridRow from 'components/LabeledGrid/LabeledGridRow';
import Color from 'components/ColorTool/Color';
import ColorGroupLabel from 'components/ColorTool/ColorGroup/ColorGroupLabel';
import type { ColorFieldProps } from 'components/ColorField';
import type { integer } from 'lib/types';
import { dropIndicator } from 'components/ColorTool/SavedColors';
import DropIndicator from 'components/ColorTool/DropIndicator';

export type ColorGroupProps = {
	/** The `name` of the Formik field to set the value of the selected color into. */
	name: ColorFieldProps['name'],
	editing?: boolean,
	/** The `ColorGroup` to render, or undefined if colors without a group should be rendered. */
	children: ClientColorGroup | undefined,
	/** The index in the `colors` array at which a drop indicator should be inserted. */
	dropIndicatorIndex?: integer
};

/** A rendered representation of a `ClientColorGroup`. */
const ColorGroup = ({
	name,
	editing,
	children: colorGroup,
	dropIndicatorIndex
}: ColorGroupProps) => {
	const [story] = useContext(PrivateStoryContext)!;

	const colorGroupID = colorGroup?.id;

	const colors: Array<ClientColor | typeof dropIndicator> = (
		story.colors.filter(color => color.group === colorGroupID)
	);
	if (dropIndicatorIndex !== undefined) {
		colors.splice(dropIndicatorIndex, 0, dropIndicator);
	}

	const colorsComponent = (
		// When not `editing`, this container `div` is necessary to allow the color buttons to wrap normally rather than being flex items.
		// When `editing`, it's to indent the colors.
		<div className="color-group-colors">
			{colors.length !== 0 && (
				colors.map(color => (
					color === dropIndicator ? (
						<DropIndicator key="drag-indicator" />
					) : (
						<Color
							key={color.id}
							name={name}
							editing={editing}
						>
							{color}
						</Color>
					)
				))
			)}
			{(
				// Check if there are no colors, possibly other than the drop indicator.
				colors.length === 0 || (
					colors.length === 1
					&& colors[0] === dropIndicator
				)
			) && (
				<span className="translucent">
					(Empty)
				</span>
			)}
		</div>
	);

	return editing || story.colorGroups.length === 0 ? (
		<div
			id={`color-group-${colorGroupID}`}
			className="color-group"
		>
			{colorGroup ? (
				<ColorGroupLabel>{colorGroup}</ColorGroupLabel>
			) : (
				// Only label these colors as not in a group if there are any groups.
				story.colorGroups.length !== 0 && (
					<Label block>
						(No Group)
					</Label>
				)
			)}
			{colorsComponent}
		</div>
	) : (
		<LabeledGridRow
			label={colorGroup ? colorGroup.name : '(No Group)'}
		>
			{colorsComponent}
		</LabeledGridRow>
	);
};

export default ColorGroup;
