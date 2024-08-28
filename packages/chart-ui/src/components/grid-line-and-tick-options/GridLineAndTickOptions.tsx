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
import { Checkbox, ColorPicker, Dropdown, Select } from '@univerjs/design';
import { MoreDownSingle } from '@univerjs/icons';
import clsx from 'clsx';
import { tickThicknessOptions } from '../options';
import styles from './index.module.less';

export interface IGridLineAndTickOptions {
    gridLine: boolean;
    color: string;
    width: number;
}

export interface IGridLineAndTickOptionsProps extends Partial<IGridLineAndTickOptions> {
    onChange?: <K extends keyof IGridLineAndTickOptions = keyof IGridLineAndTickOptions> (key: K, value: IGridLineAndTickOptions[K]) => void;
}

export const GridLineAndTickOptions = (props: IGridLineAndTickOptionsProps) => {
    const { gridLine, color, width, onChange } = props;

    const [colorDropdownVisible, setColorDropdownVisible] = useState(false);
    return (
        <div>
            <Checkbox checked={gridLine} onChange={(checked) => onChange?.('gridLine', Boolean(checked))}>Major gridlines</Checkbox>
            <div>
                <div>
                    <h5>GridLine color</h5>
                    <Dropdown
                        visible={colorDropdownVisible}
                        onVisibleChange={setColorDropdownVisible}
                        overlay={(
                            <div className={styles.gridLineAndTickOptionsColorPickerOverlay}>
                                <ColorPicker color={color} onChange={(c) => onChange?.('color', c)} />
                            </div>
                        )}
                    >
                        <div className={styles.gridLineAndTickOptionsColorPicker}>
                            {color
                                ? <div className={styles.gridLineAndTickOptionsColorPickerView} style={{ backgroundColor: color }}></div>
                                : <div>Default</div>}
                            <MoreDownSingle className={clsx({
                                [styles.gridLineAndTickOptionsRotateIcon]: colorDropdownVisible,
                            })}
                            />
                        </div>
                    </Dropdown>
                </div>
                <div>
                    <h5>GridLine thickness</h5>
                    <Select value={String(width ?? '')} onChange={(w) => onChange?.('width', Number(w))} options={tickThicknessOptions}></Select>
                </div>
            </div>
        </div>
    );
};
