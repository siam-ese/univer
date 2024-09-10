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
import { Disposable, generateRandomId, ICommandService, Inject, Injector, IResourceManagerService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { RefRangeService } from '@univerjs/sheets';
import { SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { ChartTypeBits, DataOrientation } from '../chart/constants';
import { SheetChartDataSource } from '../chart/sheet-chart-data-source';
import type { IChartSnapshot } from '../chart/types';
import { ChartModelService } from './chart-config.service';
import { ChartRenderService } from './chart-render.service';

export const SHEET_CHART_PLUGIN = 'SHEET_CHART_PLUGIN';

export interface ISheetChartSnapshot extends IChartSnapshot {
    range: IRange;
}

type OptionalProperties<T, K extends keyof T> = Omit<T, K> & {
    [P in K]+?: T[P];
};

export type ISheetChartModelOptions = OptionalProperties<ISheetChartSnapshot, 'id' | 'chartType'>;

export interface ISheetsChartResource {
    [sheetId: string]: ISheetChartSnapshot[];
}

@OnLifecycle(LifecycleStages.Rendered, SheetsChartService)
export class SheetsChartService extends Disposable {
    private _chartModelIdMap = new Map<string, Map<string, Set<string>>>();
    private _dataSourceMap = new Map<string, SheetChartDataSource>();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetCanvasFloatDomManagerService) private readonly _sheetCanvasFloatDomManagerService: SheetCanvasFloatDomManagerService,
        @IResourceManagerService private readonly _resourcesManagerService: IResourceManagerService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(ChartModelService) private readonly _chartModelService: ChartModelService,
        @Inject(ChartRenderService) private readonly _chartRenderService: ChartRenderService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initSnapshot();
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

        const { _chartModelService } = this;
        return Array.from(subUnitMap).map((id) => _chartModelService.getChartModel(id));
    }

    getChartSuggestion(range: IRange) {
        const { startRow, endRow, startColumn, endColumn } = range;
        const rowsGreaterThanColumns = endRow - startRow >= endColumn - startColumn;

        return {
            // direction: rowsGreaterThanColumns ? DataOrientation.Column : DataOrientation.Row,
            orient: DataOrientation.Row,
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

    createChartModel(unitId: string, subUnitId: string, options: ISheetChartModelOptions) {
        const { range, orient: _orient, context, dataAggregation, id, style } = options;

        const chartModelId = id ?? generateRandomId();
        // Init suggest chart type and data direction to chart model
        const chartSuggestion = this.getChartSuggestion(range);
        const chartType = options.chartType ?? chartSuggestion.chartType;
        const orient = _orient ?? chartSuggestion.orient;

        const dataSource = new SheetChartDataSource({
            unitId,
            subUnitId,
            range,
            orient,
        }, this._injector);

        const chartModel = this._chartModelService.createChartModel(chartModelId, {
            dataSource,
            chartType: chartType ?? chartSuggestion.chartType,
            dataAggregation,
            style,
            context,
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
        return this._chartModelService.getChartModel(id);
    }

    private _serializeChartForUnit(unitId: string): string {
        const subUnitMap = this._chartModelIdMap.get(unitId);
        if (!subUnitMap) {
            return '{}';
        }

        const json: ISheetsChartResource = {};
        subUnitMap.forEach((chartModelIds, subUnit) => {
            json[subUnit] = Array.from(chartModelIds).map((id) => {
                const chartModel = this._chartModelService.getChartModel(id);
                const dataSource = this.getChartDataSource(id);

                if (!chartModel || !dataSource) {
                    return null;
                }

                return {
                    range: dataSource.range,
                    ...chartModel.serialize(),
                };
            }).filter((v) => !!v);
        });

        return JSON.stringify(json);
    }

    private _deserializeChartForUnit(unitId: string, json: ISheetsChartResource) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) {
            return;
        }

        Object.keys(json).forEach((worksheetId: string) => {
            const snapshots = json[worksheetId];
            if (!snapshots || snapshots.length <= 0) {
                return;
            }

            snapshots.forEach((snapshot) => {
                this.createChartModel(unitId, worksheetId, snapshot);
            });
        });
    }

    private _initSnapshot() {
        this._resourcesManagerService.registerPluginResource<ISheetsChartResource>({
            pluginName: SHEET_CHART_PLUGIN,
            businesses: [UniverInstanceType.UNIVER_SHEET],
            toJson: (id) => this._serializeChartForUnit(id),
            parseJson: (json) => JSON.parse(json),
            onLoad: (unitId, value) => {
                this._deserializeChartForUnit(unitId, value);
            },
            onUnLoad: (unitId: string) => {
                this._chartModelIdMap.get(unitId)?.forEach((subUnitMap) => {
                    Array.from(subUnitMap.values()).forEach((id) => {
                        this._chartModelService.getChartModel(id)?.dispose();
                        this._chartModelService.removeChartModel(id);
                    });
                });
            },
        });
    }

    override dispose() {
        super.dispose();
        this._chartModelService.dispose();
        this._chartModelIdMap.clear();
        this._dataSourceMap.forEach((dataSource) => dataSource.dispose());
        this._dataSourceMap.clear();
    }
}
