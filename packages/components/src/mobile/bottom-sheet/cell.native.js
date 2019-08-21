/**
 * External dependencies
 */
import { TouchableOpacity, Text, View, TextInput, I18nManager } from 'react-native';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { Dashicon } from '@wordpress/components';
import { Component } from '@wordpress/element';
import { __, _x, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import styles from './styles.scss';
import platformStyles from './cellStyles.scss';
// `useStyle as getStyle`: Hack to avoid lint thinking this is a React Hook
import { withTheme, useStyle as getStyle } from '../dark-mode';

class BottomSheetCell extends Component {
	constructor( props ) {
		super( ...arguments );
		this.state = {
			isEditingValue: props.autoFocus || false,
		};
	}

	componentDidUpdate() {
		if ( this.state.isEditingValue ) {
			this._valueTextInput.focus();
		}
	}

	render() {
		const {
			accessibilityLabel,
			accessibilityHint,
			accessibilityRole,
			onPress,
			label,
			value,
			valuePlaceholder = '',
			icon,
			labelStyle = {},
			valueStyle = {},
			onChangeValue,
			children,
			editable = true,
			separatorType,
			style = {},
			theme,
			...valueProps
		} = this.props;

		const showValue = value !== undefined;
		const isValueEditable = editable && onChangeValue !== undefined;
		const cellLabelStyle = getStyle( styles.cellLabel, styles.cellTextDark, theme );
		const cellLabelCenteredStyle = getStyle( styles.cellLabelCentered, styles.cellTextDark, theme );
		const defaultLabelStyle = showValue || icon !== undefined ? cellLabelStyle : cellLabelCenteredStyle;
		const drawSeparator = ( separatorType && separatorType !== 'none' ) || separatorStyle === undefined;

		const onCellPress = () => {
			if ( isValueEditable ) {
				startEditing();
			} else if ( onPress !== undefined ) {
				onPress();
			}
		};

		const finishEditing = () => {
			this.setState( { isEditingValue: false } );
		};

		const startEditing = () => {
			if ( this.state.isEditingValue === false ) {
				this.setState( { isEditingValue: true } );
			}
		};

		const separatorStyle = () => {
			//eslint-disable-next-line @wordpress/no-unused-vars-before-return
			const defaultSeparatorStyle = getStyle( styles.separator, styles.separatorDark, theme );
			const cellSeparatorStyle = getStyle( styles.cellSeparator, styles.cellSeparatorDark, theme );
			const leftMarginStyle = { ...cellSeparatorStyle, ...platformStyles.separatorMarginLeft };
			switch ( separatorType ) {
				case 'leftMargin':
					return leftMarginStyle;
				case 'fullWidth':
					return defaultSeparatorStyle;
				case 'none':
					return undefined;
				case undefined:
					return showValue ? leftMarginStyle : defaultSeparatorStyle;
			}
		};

		const getValueComponent = () => {
			const styleRTL = I18nManager.isRTL && styles.cellValueRTL;
			const cellValueStyle = getStyle( styles.cellValue, styles.cellTextDark, theme );
			const finalStyle = { ...cellValueStyle, ...valueStyle, ...styleRTL };

			// To be able to show the `middle` ellipsizeMode on editable cells
			// we show the TextInput just when the user wants to edit the value,
			// and the Text component to display it.
			// We also show the TextInput to display placeholder.
			const shouldShowPlaceholder = isValueEditable && value === '';
			return this.state.isEditingValue || shouldShowPlaceholder ? (
				<TextInput
					ref={ ( c ) => this._valueTextInput = c }
					numberOfLines={ 1 }
					style={ finalStyle }
					value={ value }
					placeholder={ valuePlaceholder }
					placeholderTextColor={ '#87a6bc' }
					onChangeText={ onChangeValue }
					editable={ isValueEditable }
					pointerEvents={ this.state.isEditingValue ? 'auto' : 'none' }
					onFocus={ startEditing }
					onBlur={ finishEditing }
					{ ...valueProps }
				/>
			) : (
				<Text
					style={ { ...cellValueStyle, ...valueStyle } }
					numberOfLines={ 1 }
					ellipsizeMode={ 'middle' }
				>
					{ value }
				</Text>
			);
		};

		const getAccessibilityLabel = () => {
			if ( accessibilityLabel || ! showValue ) {
				return accessibilityLabel || label;
			}
			return isEmpty( value ) ?
				sprintf(
					/* translators: accessibility text. Empty state of a inline textinput cell. %s: The cell's title */
					_x( '%s. Empty', 'inline textinput cell' ),
					label
				) :
				// Separating by ',' is necessary to make a pause on urls (non-capitalized text)
				sprintf(
					/* translators: accessibility text. Inline textinput title and value.%1: Cell title, %2: cell value. */
					_x( '%1$s, %2$s', 'inline textinput cell' ),
					label,
					value
				);
		};

		return (
			<TouchableOpacity
				accessible={ ! this.state.isEditingValue }
				accessibilityLabel={ getAccessibilityLabel() }
				accessibilityRole={ accessibilityRole || 'button' }
				accessibilityHint={ isValueEditable ?
					/* translators: accessibility text */
					__( 'Double tap to edit this value' ) :
					accessibilityHint
				}
				onPress={ onCellPress }
				style={ { ...styles.clipToBounds, ...style } }
			>
				<View style={ styles.cellContainer }>
					<View style={ styles.cellRowContainer }>
						{ icon && (
							<View style={ styles.cellRowContainer }>
								<Dashicon icon={ icon } size={ 24 } color={ theme === 'dark' && '#C3C4C7' } />
								<View style={ platformStyles.labelIconSeparator } />
							</View>
						) }
						<Text numberOfLines={ 1 } style={ { ...defaultLabelStyle, ...labelStyle } }>
							{ label }
						</Text>
					</View>
					{ showValue && getValueComponent() }
					{ children }
				</View>
				{ drawSeparator && (
					<View style={ separatorStyle() } />
				) }
			</TouchableOpacity>
		);
	}
}

export default withTheme( BottomSheetCell );
