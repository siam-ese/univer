/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState } from 'react';
import { ColorPicker, Dropdown } from '@univerjs/design';
import { useDependency } from '@univerjs/core';
import { ComponentManager } from '@univerjs/ui';
import { AlignTextBothSingle, MoreDownSingle } from '@univerjs/icons';
import clsx from 'clsx';
import { defaultChartStyle } from '@univerjs/chart';
import type { OptionType } from '../options';
import { fontSizeOptions, textAlignOptions } from '../options';
import { DropdownMenu } from '../dropdown-menu';
import styles from './index.module.less';

export interface IFontFormatStyle {
    fontSize: number;
    color: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    align?: string;
    controls?: {
        // fontSize?: boolean;
        // color?: boolean;
        // bold?: boolean;
        // italic?: boolean;
        // underline?: boolean;
        // strikethrough?: boolean;
        align?: boolean;
    };
}

export type PropertyChangeFunction<T, K extends keyof T = keyof T> = (name: K, value: T[K]) => void;

export interface IFontFormatBarProps extends Partial<IFontFormatStyle> {
    className?: string;
    onChange?: PropertyChangeFunction<Omit<IFontFormatStyle, 'controls'>>;
}

export const FontFormatBar = (props: IFontFormatBarProps) => {
    const {
        className,
        fontSize = defaultChartStyle.textStyle.titleFontSize,
        color,
        bold,
        italic,
        underline,
        strikethrough,
        controls,
        onChange,
    } = props;

    const componentManager = useDependency(ComponentManager);
    const BoldSingleIcon = componentManager.get('BoldSingle');
    const ItalicSingleIcon = componentManager.get('ItalicSingle');
    const UnderlineSingleIcon = componentManager.get('UnderlineSingle');
    const StrikethroughSingle = componentManager.get('StrikethroughSingle');
    const FontIcon = componentManager.get('FontColor');

    const [colorDropdownVisible, setColorDropdownVisible] = useState(false);

    return (
        <div className={clsx(styles.fontFormatBar, className)}>
            <DropdownMenu menus={fontSizeOptions as unknown as OptionType[]} onSelect={(item) => onChange?.('fontSize', Number(item.value))}>
                {(visible) => (
                    <div className={clsx(styles.fontFormatBarItem, styles.fontFormatBarMenuItem)}>
                        <span>{fontSize}</span>
                        <MoreDownSingle className={clsx(styles.fontFormatBarMenuIcon, { [styles.fontFormatBarRotateIcon]: visible })} />
                    </div>
                )}
            </DropdownMenu>
            <Dropdown
                visible={colorDropdownVisible}
                onVisibleChange={setColorDropdownVisible}
                overlay={(
                    <div className={styles.fontFormatBarColorPickerOverlay}>
                        {' '}
                        <ColorPicker color={color} onChange={(c) => onChange?.('color', c)} />
                    </div>
                )}
            >
                <div className={clsx(styles.fontFormatBarItem, styles.fontFormatBarMenuItem)}>
                    <div className={styles.fontFormatFontColorBox}>
                        {FontIcon && <FontIcon />}
                        <div className={styles.fontFormatBarColorBar} style={{ backgroundColor: color }}></div>
                    </div>
                    <MoreDownSingle className={clsx(styles.fontFormatBarMenuIcon, { [styles.fontFormatBarRotateIcon]: colorDropdownVisible })} />
                </div>
            </Dropdown>
            {controls?.align !== false && (
                <DropdownMenu menus={textAlignOptions as unknown as OptionType[]} onSelect={(item) => onChange?.('align', item.value)}>
                    <div className={clsx(styles.fontFormatBarItem)}>
                        <AlignTextBothSingle />
                    </div>
                </DropdownMenu>
            )}
            <div
                onClick={() => onChange?.('bold', !bold)}
                className={clsx(styles.fontFormatBarItem, {
                    [styles.fontFormatBarItemActive]: bold,
                })}
            >
                {BoldSingleIcon && <BoldSingleIcon />}
            </div>
            <div
                onClick={() => onChange?.('italic', !italic)}
                className={clsx(styles.fontFormatBarItem, {
                    [styles.fontFormatBarItemActive]: italic,
                })}
            >
                {ItalicSingleIcon && <ItalicSingleIcon />}
            </div>
            <div
                onClick={() => onChange?.('underline', !underline)}
                className={clsx(styles.fontFormatBarItem, {
                    [styles.fontFormatBarItemActive]: underline,
                })}
            >
                {UnderlineSingleIcon && <UnderlineSingleIcon />}
            </div>
            <div
                onClick={() => onChange?.('strikethrough', !strikethrough)}
                className={clsx(styles.fontFormatBarItem, {
                    [styles.fontFormatBarItemActive]: strikethrough,
                })}
            >
                {StrikethroughSingle && <StrikethroughSingle />}
            </div>
        </div>
    );
};
