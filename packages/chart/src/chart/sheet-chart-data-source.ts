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

import type { CellValue, ICommandService, IDisposable, IRange, IUniverInstanceService, Nullable } from '@univerjs/core';
import { Disposable, ObjectMatrix, Rectangle } from '@univerjs/core';
import type { ISetRangeValuesCommandParams } from '@univerjs/sheets';
import { SetRangeValuesCommand } from '@univerjs/sheets';
import type { Observable } from 'rxjs';
import { BehaviorSubject, distinctUntilChanged, Subject } from 'rxjs';
import type { ChartDataSource } from './types';

export interface ISheetChartDataSourceOption {
    unitId: string;
    subUnitId: string;
    range: IRange;
}

export class SheetChartDataSource extends Disposable {
    private _dataSource$ = new Subject<ChartDataSource>();

    private _dataSourceEmitter$ = new BehaviorSubject<Observable<ChartDataSource>>(this._dataSource$.asObservable());
    dataSourceEmitter$ = this._dataSourceEmitter$.asObservable();

    get dataSource$() {
        return this._dataSourceEmitter$.getValue();
    }

    private _range$: BehaviorSubject<IRange>;
    range$: Observable<IRange>;

    private _usedRange$: BehaviorSubject<IRange>;
    usedRange$: Observable<IRange>;

    private _showHiddenValues$ = new BehaviorSubject<boolean>(false);
    showHiddenValues$ = this._showHiddenValues$.asObservable();

    get range() {
        return this._range$.getValue();
    }

    private _unwatchRangeDisposer: IDisposable | null = null;

    constructor(
        private _option: ISheetChartDataSourceOption,
        private _univerInstanceService: IUniverInstanceService,
        private _commandService: ICommandService
    ) {
        super();
        const { range } = _option;

        this._range$ = new BehaviorSubject<IRange>(range);
        this.range$ = this._range$.asObservable();

        this._usedRange$ = new BehaviorSubject<IRange>(range);
        this.usedRange$ = this._usedRange$.asObservable();

        this._init();
    }

    private _init() {
        this.disposeWithMe(
            this._usedRange$.pipe().subscribe((range) => {
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
                this._emitRangeValues(this._usedRange$.getValue());
            })
        );
    }

    private _getRangeValues(range: IRange) {
        const getCellValuesFromRange = (r: IRange) => {
            const { unitId, subUnitId } = this._option;
            const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
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
            this._dataSource$.next(rangeValues);
        }
    }

    private _watchRange(range: IRange) {
        const { unitId, subUnitId } = this._option;
        this._unwatchRangeDisposer?.dispose();
        this._unwatchRangeDisposer = this._commandService.onCommandExecuted((command) => {
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
        this._dataSourceEmitter$.next(this._dataSource$.asObservable());
        this._range$.next(range);
    }

    setUsedRange(range: IRange) {
        this._usedRange$.next(range);
    }

    setShowHiddenValues(flag: boolean) {
        this._showHiddenValues$.next(flag);
    }

    override dispose() {
        super.dispose();
        this._dataSource$.complete();
        this._range$.complete();
        this._unwatchRangeDisposer?.dispose();
    }
}
