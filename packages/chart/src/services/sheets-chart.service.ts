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

import type { IRange, Nullable } from '@univerjs/core';
import { Disposable, IResourceManagerService, IUniverInstanceService, LifecycleStages, OnLifecycle, Tools } from '@univerjs/core';
import { RefRangeService } from '@univerjs/sheets';
import { SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';
import type { ChartRenderHelper } from '../chart-dom/chart-dom-container';
import type { IChartInjector } from '../chart-injectors/line-chart-injector';
import type { IChartRenderEngineConstructor } from '../chart-render/render-engine';
import type { ChartModel } from '../chart/chart-model';
import { ChartModelManager } from '../chart/chart-model-manager';
import { lineGenerator } from '../chart/converters/line-generator';
import { type ChartDataSource, ChartType, DataDirection, type IChartSnapshot } from '../chart/types';

export const SHEET_CHART_PLUGIN = 'SHEET_CHART_PLUGIN';

export interface ISheetsChartResource {
    [key: string]: IChartSnapshot;
}

const ID_SEPARATOR = '&';

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

@OnLifecycle(LifecycleStages.Rendered, SheetsChartService)
export class SheetsChartService extends Disposable {
    private readonly _chartModelManager = new ChartModelManager();

    private readonly _activeChartModel$ = new BehaviorSubject<Nullable<ChartModel>>(null);
    readonly activeChartModel$ = this._activeChartModel$.asObservable();

    get activeChartModel(): Nullable<ChartModel> { return this._activeChartModel$.getValue(); }

    constructor(
        @Inject(SheetCanvasFloatDomManagerService) private readonly _sheetCanvasFloatDomManagerService: SheetCanvasFloatDomManagerService,
        @IResourceManagerService private readonly _resourcesManagerService: IResourceManagerService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        // this._initSnapshot();
        this._initCharts();

        // Todo: type assertion
        this.bindRenderHelper(async (id: string) => {
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
                throw new Error('Fail to mount float dom');
            }
            const el = await waitElement(floatDom.id);

            return {
                id: el,
                dispose: floatDom.dispose,
            };
        });
    }

    private _initCharts() {
        this._chartModelManager.generatorProvider.addGenerator(ChartType.Line, lineGenerator);
    }

    bindRenderHelper(renderHelper: ChartRenderHelper) {
        this._chartModelManager.renderAdapter.bindRenderHelper(renderHelper);
    }

    addInjector(injector: IChartInjector) {
        injector.injectDataGenerator?.(this._chartModelManager.generatorProvider);
        const renderModel = this._chartModelManager.renderAdapter.getRenderModel();
        renderModel && injector.injectRenderConverter?.(renderModel);
    }

    registerRenderEngine(name: string, renderEngineCtor: IChartRenderEngineConstructor) {
        this._chartModelManager.renderAdapter.registerRenderEngine(name, renderEngineCtor);
    }

    createChartModel(unitId: string, subUnitId: string, range: IRange) {
        const chartModelId = [unitId, subUnitId, Tools.generateRandomId()].join(ID_SEPARATOR);

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
        const { startRow, endRow, startColumn, endColumn } = range;
        const rowsGreaterThanColumns = endRow - startRow > endColumn - startColumn;
        const chartModel = this._chartModelManager.createChartModel({
            id: chartModelId,
            dataSource: dataSource$,
            dataConfig: {
                direction: rowsGreaterThanColumns ? DataDirection.Column : DataDirection.Row,
            },
        });

        const chartType = rowsGreaterThanColumns ? ChartType.Line : ChartType.Bar;
        chartModel.setChart(chartType);

        return chartModel;
    }

    getChartModel(id: string) {
        this._chartModelManager.getChartModel(id);
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
        this._chartModelManager.dispose();
    }
}
