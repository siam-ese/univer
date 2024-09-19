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
import { Dropdown, Menu, MenuItem } from '@univerjs/design';
import type { OptionType } from '../options';

export interface IDropdownMenuProps {
    menus: OptionType[];
    children: React.ReactElement | ((visible: boolean) => React.ReactElement);
    onSelect?: (menu: OptionType, index: number) => void;
}

export const DropdownMenu = (props: IDropdownMenuProps) => {
    const { menus, onSelect, children } = props;
    const [visible, setVisible] = useState(false);

    return (
        <Dropdown
            visible={visible}
            onVisibleChange={setVisible}
            overlay={(
                <Menu>
                    {menus.map((menu, index) => (
                        <MenuItem
                            key={menu.value}
                            onClick={() => {
                                setVisible(false);
                                onSelect?.(menu, index);
                            }}
                        >
                            {menu.label}
                        </MenuItem>
                    ))}
                </Menu>
            )}
        >
            {typeof children === 'function' ? children(visible) : children}
        </Dropdown>
    );
};
