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

import { ChartModelService } from '@univerjs/chart';
import { Disposable, ICommandService, Inject, Injector, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { ComponentManager, IMenuService, ISidebarService } from '@univerjs/ui';
import { IDrawingManagerService } from '@univerjs/drawing';

import type { IDisposable } from '@univerjs/core';
import { ChartEditPanel } from '../views/chart-edit-panel';

const CHART_EDIT_PANEL_KEY = 'sheet.chart.edit.panel';

@OnLifecycle(LifecycleStages.Rendered, SheetsChartUIController)
export class SheetsChartUIController extends Disposable {
    private _sidebarDisposable: IDisposable | null = null;

    constructor(
        @IDrawingManagerService private _drawingManagerService: IDrawingManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ChartModelService) private readonly _ChartModelService: ChartModelService,
        @Inject(ISidebarService) private _sidebarService: ISidebarService,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuService private readonly _menuService: IMenuService
    ) {
        super();
        this._initPanel();
        this._initMenus();
        this._initCommands();

        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((sheet) => {
                if (!sheet) this._sidebarDisposable?.dispose();
            })
        );
    }

    openPanel() {
        this._sidebarDisposable = this._sidebarService.open({
            width: 340,
            children: {
                label: CHART_EDIT_PANEL_KEY,
            },
            onClose: () => this._sidebarDisposable = null,
        });
    }

    hidePanel() {
        this._sidebarDisposable?.dispose();
    }

    private _initPanel() {
        const { _ChartModelService } = this;
        this._componentManager.register(CHART_EDIT_PANEL_KEY, ChartEditPanel);
        this.disposeWithMe(this._drawingManagerService.focus$.subscribe((params) => {
            const drawing = params[0];
            if (!drawing) {
                this.hidePanel();
                return;
            }
            const chartModel = _ChartModelService.getChartModel(drawing.drawingId);
            if (!chartModel) {
                return;
            }

            if (drawing.drawingId === chartModel.id) {
                _ChartModelService.setActiveChartModel(chartModel);
                this.openPanel();
            }
        }));
    }

    private _initMenus() {
        // this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(ChartMenuItemFactory), {}));
    }

    private _initCommands(): void {
        [
            // InsertChartCommand,
            // InsertSheetsChartMutation,
            // SetSheetsFilterCriteriaMutation,
            // SetSheetsFilterRangeMutation,
            // ReCalcSheetsFilterMutation,
            // RemoveSheetsFilterMutation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }
}
