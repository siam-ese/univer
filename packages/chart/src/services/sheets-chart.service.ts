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
import { Disposable, generateRandomId, ICommandService, Inject, IResourceManagerService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { RefRangeService } from '@univerjs/sheets';
import { SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { BehaviorSubject } from 'rxjs';
import type { ChartModel } from '../chart/chart-model';
import { ChartTypeBits, DataDirection } from '../chart/constants';
import { SheetChartDataSource } from '../chart/sheet-chart-data-source';
import type { IChartSnapshot } from '../chart/types';
import { SheetsChartConfigService } from './sheets-chart-config.service';
import { SheetsChartRenderService } from './sheets-chart-render.service';

export const SHEET_CHART_PLUGIN = 'SHEET_CHART_PLUGIN';

export interface ISheetsChartResource {
    [key: string]: IChartSnapshot;
}

@OnLifecycle(LifecycleStages.Rendered, SheetsChartService)
export class SheetsChartService extends Disposable {
    private _chartModelIdMap = new Map<string, Map<string, Set<string>>>();
    private readonly _activeChartModel$ = new BehaviorSubject<Nullable<ChartModel>>(null);
    readonly activeChartModel$ = this._activeChartModel$.asObservable();

    get activeChartModel(): Nullable<ChartModel> { return this._activeChartModel$.getValue(); }

    private _dataSourceMap = new Map<string, SheetChartDataSource>();

    constructor(
        @Inject(SheetCanvasFloatDomManagerService) private readonly _sheetCanvasFloatDomManagerService: SheetCanvasFloatDomManagerService,
        @IResourceManagerService private readonly _resourcesManagerService: IResourceManagerService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetsChartConfigService) private readonly _sheetsChartConfigService: SheetsChartConfigService,
        @Inject(SheetsChartRenderService) private readonly _sheetsChartRenderService: SheetsChartRenderService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initCharts();
    }

    private _initCharts() {
    }

    setActiveChartModel(chartModel: ChartModel) {
        this._activeChartModel$.next(chartModel);
    }

    getUnitChartModels(unitId: string, subUnitId: string) {
        const unitMap = this._chartModelIdMap.get(unitId);
        if (!unitMap) {
            return [];
        }
        const subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            return [];
        }

        const { _sheetsChartConfigService } = this;
        return Array.from(subUnitMap).map((id) => _sheetsChartConfigService.getChartModel(id));
    }

    getChartSuggestion(range: IRange) {
        const { startRow, endRow, startColumn, endColumn } = range;
        const rowsGreaterThanColumns = endRow - startRow >= endColumn - startColumn;

        return {
            // direction: rowsGreaterThanColumns ? DataDirection.Column : DataDirection.Row,
            direction: DataDirection.Row,
            // chartType: rowsGreaterThanColumns ? ChartTypeBits.Line : ChartTypeBits.Bar,
            chartType: ChartTypeBits.Radar,
        };
    }

    ensureChartModelCollection(unitId: string, subUnitId: string) {
        let unitMap = this._chartModelIdMap.get(unitId);
        if (!unitMap) {
            unitMap = new Map();
            this._chartModelIdMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new Set<string>();
            unitMap.set(subUnitId, subUnitMap);
        }

        return subUnitMap;
    }

    getChartDataSource(id: string) {
        return this._dataSourceMap.get(id);
    }

    createChartModel(unitId: string, subUnitId: string, range: IRange) {
        const dataSource = new SheetChartDataSource({
            unitId,
            subUnitId,
            range,
        }, this._univerInstanceService, this._commandService);

        const chartModelId = generateRandomId();
        // Init suggest chart type and data direction to chart model
        const chartSuggestion = this.getChartSuggestion(range);
        const chartModel = this._sheetsChartConfigService.createChartModel(chartModelId, {
            dataSource$: dataSource.dataSource$,
            chartType: chartSuggestion.chartType,
            dataTransformConfig: {
                direction: chartSuggestion.direction,
            },
        });

        dataSource.dataSourceEmitter$.subscribe((dataSource$) => {
            chartModel.setDataSource(dataSource$);
        });

        const collection = this.ensureChartModelCollection(unitId, subUnitId);

        collection.add(chartModel.id);

        chartModel.onDispose(() => {
            collection.delete(chartModel.id);
            dataSource.dispose();
            this._dataSourceMap.delete(chartModel.id);
        });

        this._dataSourceMap.set(chartModel.id, dataSource);

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
