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

import { type MenuSchemaType, RibbonOthersGroup } from '@univerjs/ui';
import { LocaleOperation } from '../commands/operations/locale.operation';
import {
    ChangeUserMenuItemFactory,
    ConfirmMenuItemFactory,
    CreateEmptySheetMenuItemFactory,
    CreateFloatDOMMenuItemFactory,
    DialogMenuItemFactory,
    DisposeCurrentUnitMenuItemFactory,
    DisposeUniverItemFactory,
    FLOAT_DOM_ITEM_MENU_ID,
    FloatDomMenuItemFactory,
    LocaleMenuItemFactory,
    MessageMenuItemFactory,
    NotificationMenuItemFactory,
    SaveSnapshotSetEditableMenuItemFactory,
    SetEditableMenuItemFactory,
    ShowCellContentMenuItemFactory,
    SidebarMenuItemFactory,
    ThemeMenuItemFactory,
    UNIT_ITEM_MENU_ID,
    UnitMenuItemFactory,
} from '../controllers/menu';
import { ThemeOperation } from '../commands/operations/theme.operation';
import { NotificationOperation } from '../commands/operations/notification.operation';
import { ConfirmOperation } from '../commands/operations/confirm.operation';
import { DialogOperation } from '../commands/operations/dialog.operation';
import { MessageOperation } from '../commands/operations/message.operation';
import { SaveSnapshotOptions } from '../commands/operations/save-snapshot.operations';
import { SetEditable } from '../commands/operations/set.editable.operation';
import { SidebarOperation } from '../commands/operations/sidebar.operation';
import { CreateEmptySheetCommand, DisposeCurrentUnitCommand, DisposeUniverCommand } from '../commands/commands/unit.command';
import { CreateFloatDomCommand } from '../commands/commands/float-dom.command';
import { ChangeUserCommand } from '../commands/operations/change-user.operation';
import { ShowCellContentOperation } from '../commands/operations/cell.operation';

export const menuSchema: MenuSchemaType = {
    [RibbonOthersGroup.OTHERS]: {
        [LocaleOperation.id]: {
            order: 0,
            menuItemFactory: LocaleMenuItemFactory,
        },
        [ThemeOperation.id]: {
            order: 1,
            menuItemFactory: ThemeMenuItemFactory,
        },
        [NotificationOperation.id]: {
            order: 2,
            menuItemFactory: NotificationMenuItemFactory,
        },
        [DialogOperation.id]: {
            order: 3,
            menuItemFactory: DialogMenuItemFactory,
        },
        [ConfirmOperation.id]: {
            order: 4,
            menuItemFactory: ConfirmMenuItemFactory,
        },
        [MessageOperation.id]: {
            order: 5,
            menuItemFactory: MessageMenuItemFactory,
        },
        [SidebarOperation.id]: {
            order: 6,
            menuItemFactory: SidebarMenuItemFactory,
        },
        [SetEditable.id]: {
            order: 7,
            menuItemFactory: SetEditableMenuItemFactory,
        },
        [SaveSnapshotOptions.id]: {
            order: 8,
            menuItemFactory: SaveSnapshotSetEditableMenuItemFactory,
        },
        [UNIT_ITEM_MENU_ID]: {
            order: 9,
            menuItemFactory: UnitMenuItemFactory,
            [DisposeUniverCommand.id]: {
                order: 0,
                menuItemFactory: DisposeUniverItemFactory,
            },
            [DisposeCurrentUnitCommand.id]: {
                order: 1,
                menuItemFactory: DisposeCurrentUnitMenuItemFactory,
            },
            [CreateEmptySheetCommand.id]: {
                order: 2,
                menuItemFactory: CreateEmptySheetMenuItemFactory,
            },
        },
        [FLOAT_DOM_ITEM_MENU_ID]: {
            order: 10,
            menuItemFactory: FloatDomMenuItemFactory,
            [CreateFloatDomCommand.id]: {
                order: 0,
                menuItemFactory: CreateFloatDOMMenuItemFactory,
            },
            [ShowCellContentOperation.id]: {
                order: 1,
                menuItemFactory: ShowCellContentMenuItemFactory,
            },
        },
        [ChangeUserCommand.id]: {
            order: 11,
            menuItemFactory: ChangeUserMenuItemFactory,
        },
    },
};
