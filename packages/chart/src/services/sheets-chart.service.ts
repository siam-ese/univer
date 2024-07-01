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

import type { IRange } from '@univerjs/core';
import { Disposable, IResourceManagerService, IUniverInstanceService, LifecycleStages, OnLifecycle, Tools } from '@univerjs/core';
import { RefRangeService } from '@univerjs/sheets';
import { SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { Inject } from '@wendellhu/redi';
import { Observable } from 'rxjs';
import { ChartType, DataDirection } from '../chart/constants';
import type { ChartDataSource, IChartSnapshot } from '../chart/types';
import type { IChartInjector } from '../chart-injectors/line-chart-injector';
import { SheetsChartConfigService } from './sheets-chart-config.service';
import { SheetsChartRenderService } from './sheets-chart-render.service';

export const SHEET_CHART_PLUGIN = 'SHEET_CHART_PLUGIN';

export interface ISheetsChartResource {
    [key: string]: IChartSnapshot;
}

function waitElement(id: string) {
    return new Promise<HTMLElement>((resolve) => {
        const timer = setInterval(() => {
            const el = document.getElementById(id);
            if (el) {
                clearInterval(timer);
                resolve(el);
            }
        }, 50);
    });
}

// TODO: Maybe refactor to controller
@OnLifecycle(LifecycleStages.Rendered, SheetsChartService)
export class SheetsChartService extends Disposable {
    constructor(
        @Inject(SheetCanvasFloatDomManagerService) private readonly _sheetCanvasFloatDomManagerService: SheetCanvasFloatDomManagerService,
        @IResourceManagerService private readonly _resourcesManagerService: IResourceManagerService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetsChartConfigService) private readonly _sheetsChartConfigService: SheetsChartConfigService,
        @Inject(SheetsChartRenderService) private readonly _sheetsChartRenderService: SheetsChartRenderService
    ) {
        super();

        // this._initSnapshot();
        this._initCharts();

        // Todo: type assertion
        this._setChartMountHelper();
    }

    private _initCharts() {
    }

    private _setChartMountHelper() {
        const { _sheetsChartConfigService, _sheetCanvasFloatDomManagerService } = this;
        const mountHelper = (id: string) => {
            const floatDom = _sheetCanvasFloatDomManagerService.addFloatDomToPosition({
                id,
                allowTransform: true,
                initPosition: {
                    startX: 200,
                    endX: 200 + 468,
                    startY: 200,
                    endY: 200 + 369,
                },
                componentKey: 'Chart',
            });
            if (!floatDom) {
                throw new Error('Fail to create float dom');
            }

            const mountNode = document.createElement('div');
            mountNode.style.width = '100%';
            mountNode.style.height = '100%';

            waitElement(floatDom.id).then((el) => {
                el.appendChild(mountNode);
            });

            this.disposeWithMe(_sheetCanvasFloatDomManagerService.remove$.subscribe((params) => {
                if (params.id === floatDom.id) {
                    _sheetsChartConfigService.removeChartModel(floatDom.id);
                }
            }));

            return {
                id: mountNode,
                dispose: floatDom.dispose,
            };
        };
        this._sheetsChartRenderService.setChartMountHelper(mountHelper);
    }

    addInjector(injector: IChartInjector) {
        injector.injectChartConfig?.(this._sheetsChartConfigService);
        const renderModel = this._sheetsChartRenderService.getRenderModel();
        if (renderModel) {
            injector.injectChartRender?.(renderModel);
        }
    }

    getChartSuggestion(range: IRange) {
        const { startRow, endRow, startColumn, endColumn } = range;
        const rowsGreaterThanColumns = endRow - startRow > endColumn - startColumn;

        return {
            direction: rowsGreaterThanColumns ? DataDirection.Column : DataDirection.Row,
            chartType: rowsGreaterThanColumns ? ChartType.Line : ChartType.Bar,
        };
    }

    createChartModel(unitId: string, subUnitId: string, range: IRange) {
        const chartModelId = Tools.generateRandomId();

        const getCellValuesFromRange = (r: IRange) => {
            const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
            if (!workbook) return;

            const workSheet = workbook?.getSheetBySheetId(subUnitId);
            if (!workSheet) return;

            return workSheet.getRange(r).getValues().map((cells) => cells.map((cell) => cell?.v));
        };
        // style
        const dataSource$ = new Observable<ChartDataSource>((subscriber) => {
            const cellValues = getCellValuesFromRange(range);
            if (cellValues) {
                subscriber.next(cellValues);
            }
        });

        // Init suggest chart type and data direction to chart model
        const chartSuggestion = this.getChartSuggestion(range);
        const chartModel = this._sheetsChartConfigService.createChartModel({
            id: chartModelId,
            dataSource: dataSource$,
            dataConfig: {
                direction: chartSuggestion.direction,
            },
        });

        chartModel.setChart(chartSuggestion.chartType);

        return chartModel;
    }

    getChartModel(id: string) {
        return this._sheetsChartConfigService.getChartModel(id);
    }

    private _serializeAutoFiltersForUnit(unitId: string): string {
        // const allFilterModels = this._filterModels.get(unitId);
        // if (!allFilterModels) {
        //     return '{}';
        // }

        // const json: ISheetsFilterResource = {};
        // allFilterModels.forEach((model, worksheetId) => {
        //     json[worksheetId] = model.serialize();
        // });
        return '{}';
        // return JSON.stringify(json);
    }

    private _deserializeAutoFiltersForUnit(unitId: string, value: ISheetsChartResource) {
        // const workbook = this._univerInstanceService.getUniverSheetInstance(unitId)!;
        // Object.keys(json).forEach((worksheetId: WorksheetID) => {
        //     const autoFilter = json[worksheetId]!;
        //     const filterModel = FilterModel.deserialize(unitId, worksheetId, workbook.getSheetBySheetId(worksheetId)!, autoFilter);
        //     this._cacheFilterModel(unitId, worksheetId, filterModel);
        // });
    }

    private _initSnapshot() {
        this._resourcesManagerService.registerPluginResource<ISheetsChartResource>({
            pluginName: SHEET_CHART_PLUGIN,
            businesses: [2],
            toJson: (id) => this._serializeAutoFiltersForUnit(id),
            parseJson: (json) => JSON.parse(json),
            onLoad: (unitId, value) => {
                this._deserializeAutoFiltersForUnit(unitId, value);
                // this._loadedUnitId$.next(unitId);
                // this._updateActiveFilterModel();
            },
            onUnLoad: (unitId: string) => {
                // const allFilterModels = this._filterModels.get(unitId);
                // if (allFilterModels) {
                //     allFilterModels.forEach((model) => model.dispose());
                //     this._filterModels.delete(unitId);
                // }
            },
        });
    }

    override dispose() {
        super.dispose();
        this._sheetsChartConfigService.dispose();
    }
}
