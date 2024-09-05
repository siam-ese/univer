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

import React from 'react';
import { Checkbox, Select } from '@univerjs/design';
import { tickThicknessOptions } from '../options';
import panelStyles from '../../views/chart-edit-panel/index.module.less';
import { ColorPickerControl } from '../color-picker-control';
import styles from './index.module.less';

export interface IGridLineAndTickOptions {
    gridLine: boolean;
    color: string;
    width: number;
}

export interface IGridLineAndTickOptionsProps extends Partial<IGridLineAndTickOptions> {
    className?: string;
    onChange?: <K extends keyof IGridLineAndTickOptions = keyof IGridLineAndTickOptions> (key: K, value: IGridLineAndTickOptions[K]) => void;
}

export const GridLineAndTickOptions = (props: IGridLineAndTickOptionsProps) => {
    const { className, gridLine, color, width, onChange } = props;

    return (
        <div className={className}>
            <Checkbox checked={gridLine} onChange={(checked) => onChange?.('gridLine', Boolean(checked))}>Major gridlines</Checkbox>
            <div className={panelStyles.styleTabPanelRow}>
                <div className={panelStyles.styleTabPanelRowHalf}>
                    <h5>GridLine color</h5>
                    <ColorPickerControl color={color ?? ''} onChange={(c) => onChange?.('color', c)} />
                </div>
                <div className={styles.styleTabPanelRowHalf}>
                    <h5>GridLine thickness</h5>
                    <Select value={String(width ?? '')} onChange={(w) => onChange?.('width', Number(w))} options={tickThicknessOptions}></Select>
                </div>
            </div>
        </div>
    );
};
