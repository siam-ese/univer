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

import type { CellValue, IDisposable, Injector, IRange, Nullable } from '@univerjs/core';
import { Disposable, ICommandService, IUniverInstanceService, ObjectMatrix, Rectangle } from '@univerjs/core';
import type { ISetRangeValuesCommandParams } from '@univerjs/sheets';
import { SetRangeValuesCommand } from '@univerjs/sheets';
import type { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Subject, tap } from 'rxjs';
import type { ChartDataSourceValues, IChartDataSource } from './types';
import { DataOrientation } from './constants';
import { toColumnOrient } from './chart-data-operators';

export interface ISheetChartDataSourceOption {
    unitId: string;
    subUnitId: string;
    range: IRange;
    orient: DataOrientation;
}

export class SheetChartDataSource extends Disposable implements IChartDataSource {
    private _data$ = new Subject<ChartDataSourceValues>();
    private _combinedData$: Observable<ChartDataSourceValues>; ;
    get data$() {
        return this._combinedData$;
    }

    private _data: ChartDataSourceValues = [];
    get data() {
        return this._data;
    }

    private _rebuild$ = new Subject<void>();
    readonly rebuild$ = this._rebuild$.asObservable();

    private _orient$: BehaviorSubject<DataOrientation>;
    orient$: Observable<DataOrientation>;

    private _range$: BehaviorSubject<IRange>;
    readonly range$: Observable<IRange>;

    // private _usedRange$: BehaviorSubject<IRange>;
    // usedRange$: Observable<IRange>;

    private _showHiddenValues$ = new BehaviorSubject<boolean>(false);
    showHiddenValues$ = this._showHiddenValues$.asObservable();

    get range() {
        return this._range$.getValue();
    }

    private _unwatchRangeDisposer: IDisposable | null = null;

    constructor(
        private _option: ISheetChartDataSourceOption,
        private readonly _injector: Injector
    ) {
        super();
        const { range, orient } = _option;

        this._range$ = new BehaviorSubject<IRange>(range);
        this.range$ = this._range$.asObservable();

        this._orient$ = new BehaviorSubject(orient);
        this.orient$ = this._orient$.asObservable();

        // this._usedRange$ = new BehaviorSubject<IRange>(range);
        // this.usedRange$ = this._usedRange$.asObservable();

        // setTimeout(() => {
        this._init();
        // });
    }

    private _asyncRebuild() {
        setTimeout(() => {
            this._rebuild$.next();
        });
    }

    private _init() {
        this.disposeWithMe(
            this.range$.pipe(
                tap(() => this._asyncRebuild())
            ).subscribe((range) => {
                this._watchRange(range);

                setTimeout(() => {
                    this._emitRangeValues(range);
                });
            })
        );
        this.disposeWithMe(
            this._showHiddenValues$.pipe(
                distinctUntilChanged()
            ).subscribe(() => {
                this._emitRangeValues(this._range$.getValue());
            })
        );

        this._combinedData$ = combineLatest([
            this._data$.asObservable(),
            this.orient$.pipe(
                distinctUntilChanged(),
                tap(() => this._asyncRebuild())
            ),
        ]).pipe(
            map(([data, orient]) => orient === DataOrientation.Column ? toColumnOrient(data) : data),
            tap((data) => {
                this._data = data;
            })
        );
    }

    setOrient(orient: DataOrientation): void {
        this._orient$.next(orient);
    }

    private _getRangeValues(range: IRange) {
        const getCellValuesFromRange = (r: IRange) => {
            const { unitId, subUnitId } = this._option;
            const univerInstanceService = this._injector.get(IUniverInstanceService);
            const workbook = univerInstanceService.getUniverSheetInstance(unitId);
            if (!workbook) return;

            const workSheet = workbook?.getSheetBySheetId(subUnitId);
            if (!workSheet) return;

            const matrix = new ObjectMatrix<Nullable<CellValue>>();
            workSheet.getRange(r).forEach((row, col) => {
                if (workSheet.getColVisible(col) && workSheet.getRowVisible(row)) {
                    matrix.setValue(row, col, workSheet.getCell(row, col)?.v);
                }
            });
            return matrix.toArray().filter(Boolean);
        };
        return getCellValuesFromRange(range);
    }

    private _emitRangeValues(range: IRange) {
        const rangeValues = this._getRangeValues(range);
        if (rangeValues) {
            this._data$.next(rangeValues);
        }
    }

    private _watchRange(range: IRange) {
        const { unitId, subUnitId } = this._option;
        this._unwatchRangeDisposer?.dispose();
        const commandService = this._injector.get(ICommandService);
        this._unwatchRangeDisposer = commandService.onCommandExecuted((command) => {
            if (command.id === SetRangeValuesCommand.id) {
                const { subUnitId: commandSubUnitId, unitId: commandUnitId, range: commandRange } = command.params as ISetRangeValuesCommandParams;
                if (commandSubUnitId === subUnitId
                    && commandUnitId === unitId
                    && commandRange && Rectangle.contains(range, commandRange)
                ) {
                    this._emitRangeValues(this.range);
                }
            }
        });
    }

    setRange(range: IRange) {
        // this._rebuild$.next();
        // this._dataSourceEmitter$.next(this._dataSource$.asObservable());
        this._range$.next(range);
    }

    // setUsedRange(range: IRange) {
    //     this._usedRange$.next(range);
    // }

    setShowHiddenValues(flag: boolean) {
        this._showHiddenValues$.next(flag);
    }

    override dispose() {
        super.dispose();
        this._data$.complete();
        this._rebuild$.complete();
        this._orient$.complete();
        this._range$.complete();
        this._unwatchRangeDisposer?.dispose();
    }
}
