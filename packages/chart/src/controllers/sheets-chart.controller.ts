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

import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { getMenuHiddenObservable, type IMenuButtonItem, IMenuService, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import { type IAccessor, Inject, Injector } from '@univerjs/core';
import { deriveStateFromActiveSheet$ } from '@univerjs/sheets-ui';
import { Observable } from 'rxjs';
import { InsertChartCommand, InsertSheetsChartMutation } from '../commands/sheets-chart.command';

export function ChartMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    // const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    // const contextService = accessor.get(IContextService);
    // const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: InsertChartCommand.id,
        group: MenuGroup.TOOLBAR_INSERT,
        type: MenuItemType.BUTTON,
        icon: 'SmileSingle',
        title: 'Insert Chart',
        tooltip: 'toolbar.insertChart',
        positions: [MenuPosition.TOOLBAR_START],
        activated$: deriveStateFromActiveSheet$(univerInstanceService, false, ({ worksheet }) => new Observable<boolean>((subscriber) => {
            subscriber.next(false);
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

@OnLifecycle(LifecycleStages.Rendered, SheetsChartController)
export class SheetsChartController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuService private readonly _menuService: IMenuService
    ) {
        super();

        this._initMenus();
        this._initCommands();
    }

    private _initMenus() {
        this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(ChartMenuItemFactory), {}));
    }

    private _initCommands(): void {
        [
            InsertChartCommand,
            InsertSheetsChartMutation,
            // SetSheetsFilterCriteriaMutation,
            // SetSheetsFilterRangeMutation,
            // ReCalcSheetsFilterMutation,
            // RemoveSheetsFilterMutation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));

        this._commandService.executeCommand(InsertChartCommand.id);
    }
}
