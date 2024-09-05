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

import { Button } from '@univerjs/design';
import clsx from 'clsx';
import React from 'react';
import type { OptionType } from '../options';
import styles from './index.module.less';

export interface IButtonSwitchProps {
    className?: string;
    options: OptionType[];
    value?: string;
    onChange?: (value: string) => void;
}

export const ButtonSwitch = (props: IButtonSwitchProps) => {
    const { value, options, onChange, className } = props;

    return (
        <div className={clsx(styles.buttonSwitch, className)}>
            {options.map((option) => <Button className={styles.buttonSwitchItem} type={value === option.value ? 'primary' : 'text'} key={option.value} onClick={() => onChange?.(option.value!)}>{option.label}</Button>)}
        </div>
    );
};
