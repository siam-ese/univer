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

import { Disposable, ICommandService, Inject, Injector, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { ComponentManager, IMenuManagerService, IShortcutService } from '@univerjs/ui';

import { AddImageSingle } from '@univerjs/icons';
import { UploadFileMenu } from '../views/upload-component/UploadFile';
import { COMPONENT_DOC_UPLOAD_FILE_MENU } from '../views/upload-component/component-name';
import { ImageUploadIcon } from '../views/menu/image.menu';
import { InsertDocImageOperation } from '../commands/operations/insert-image.operation';
import { COMPONENT_DOC_DRAWING_PANEL } from '../views/doc-image-panel/component-name';
import { DocDrawingPanel } from '../views/doc-image-panel/DocDrawingPanel';

import { ClearDocDrawingTransformerOperation } from '../commands/operations/clear-drawing-transformer.operation';
import { EditDocDrawingOperation } from '../commands/operations/edit-doc-drawing.operation';
import { SidebarDocDrawingOperation } from '../commands/operations/open-drawing-panel.operation';
import { MoveDocDrawingsCommand } from '../commands/commands/move-drawings.command';
import { DeleteDocDrawingsCommand } from '../commands/commands/delete-doc-drawing.command';
import { SetDocDrawingArrangeCommand } from '../commands/commands/set-drawing-arrange.command';
import { RemoveDocDrawingCommand } from '../commands/commands/remove-doc-drawing.command';
import { UngroupDocDrawingCommand } from '../commands/commands/ungroup-doc-drawing.command';
import { GroupDocDrawingCommand } from '../commands/commands/group-doc-drawing.command';
import { InsertDocDrawingCommand } from '../commands/commands/insert-doc-drawing.command';
import { IMoveInlineDrawingCommand, ITransformNonInlineDrawingCommand, UpdateDocDrawingDistanceCommand, UpdateDocDrawingWrappingStyleCommand, UpdateDocDrawingWrapTextCommand, UpdateDrawingDocTransformCommand } from '../commands/commands/update-doc-drawing.command';
import { DeleteDrawingsShortcutItem, MoveDrawingDownShortcutItem, MoveDrawingLeftShortcutItem, MoveDrawingRightShortcutItem, MoveDrawingUpShortcutItem } from './shortcuts/drawing.shortcut';
import { menuSchema } from './menu.schema';

@OnLifecycle(LifecycleStages.Ready, DocDrawingUIController)
export class DocDrawingUIController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IShortcutService private readonly _shortcutService: IShortcutService
    ) {
        super();

        this._init();
    }

    private _initCustomComponents(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(ImageUploadIcon, AddImageSingle));
        this.disposeWithMe(componentManager.register(COMPONENT_DOC_UPLOAD_FILE_MENU, UploadFileMenu));
        this.disposeWithMe(componentManager.register(COMPONENT_DOC_DRAWING_PANEL, DocDrawingPanel));
    }

    private _initMenus(): void {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initCommands() {
        [
            InsertDocImageOperation,
            InsertDocDrawingCommand,
            UpdateDocDrawingWrappingStyleCommand,
            UpdateDocDrawingDistanceCommand,
            UpdateDocDrawingWrapTextCommand,
            UpdateDrawingDocTransformCommand,
            IMoveInlineDrawingCommand,
            ITransformNonInlineDrawingCommand,
            RemoveDocDrawingCommand,
            SidebarDocDrawingOperation,
            ClearDocDrawingTransformerOperation,
            EditDocDrawingOperation,
            GroupDocDrawingCommand,
            UngroupDocDrawingCommand,
            MoveDocDrawingsCommand,
            DeleteDocDrawingsCommand,
            SetDocDrawingArrangeCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initShortcuts(): void {
        [
            // sheet drawing shortcuts
            MoveDrawingDownShortcutItem,
            MoveDrawingUpShortcutItem,
            MoveDrawingLeftShortcutItem,
            MoveDrawingRightShortcutItem,
            DeleteDrawingsShortcutItem,
        ].forEach((item) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(item));
        });
    }

    private _init(): void {
        this._initCommands();
        this._initCustomComponents();
        this._initMenus();
        this._initShortcuts();
    }
}
