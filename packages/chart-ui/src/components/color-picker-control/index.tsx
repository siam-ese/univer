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

import { Button, ColorPicker, Dropdown } from '@univerjs/design';
import React, { useCallback } from 'react';
import { MoreDownSingle } from '@univerjs/icons';
import clsx from 'clsx';
import styles from './index.module.less';

export interface IColorPickerControlProps {
    color: string;
    onChange?: (color: string) => void;
}

export const ColorPickerControl = (props: IColorPickerControlProps) => {
    const { color, onChange } = props;
    const [visible, setVisible] = React.useState(false);

    const onColorPickerChange = useCallback((color: string) => {
        onChange?.(color);
        setVisible(false);
    }, [onChange]);

    return (
        <Dropdown
            visible={visible}
            onVisibleChange={setVisible}
            overlay={(
                <div className={styles.colorPickerControlOverlay}>
                    <ColorPicker color={color} onChange={onColorPickerChange} />
                </div>
            )}
        >
            <Button className={styles.colorPickerControl}>
                <div className={styles.colorPickerControlViewBox}>
                    <div className={styles.colorPickerControlView} style={{ backgroundColor: color }}></div>
                    <MoreDownSingle className={clsx(styles.colorPickerControlArrow, {
                        [styles.colorPickerControlRotate]: visible,
                    })}
                    />
                </div>
            </Button>
        </Dropdown>
    );
};
