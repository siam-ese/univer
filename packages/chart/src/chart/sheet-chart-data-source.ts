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

import type { ICommandService, IRange, IUniverInstanceService } from '@univerjs/core';
import { Disposable, Rectangle } from '@univerjs/core';
import type { ISetRangeValuesCommandParams } from '@univerjs/sheets';
import { SetRangeValuesCommand } from '@univerjs/sheets';
import type { IDisposable } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';
import type { ChartDataSource } from './types';

export interface ISheetChartDataSourceOption {
    unitId: string;
    subUnitId: string;
    range: IRange;
}

export class SheetChartDataSource extends Disposable {
    private _dataSource$ = new Subject<ChartDataSource>();
    dataSource$ = this._dataSource$.asObservable();

    private _range$: BehaviorSubject<IRange>;
    range$: Observable<IRange>;

    get range() {
        return this._range$.getValue();
    }

    private _watchRangeDisposer: IDisposable;

    constructor(
        private _option: ISheetChartDataSourceOption,
        private _univerInstanceService: IUniverInstanceService,
        private _commandService: ICommandService
    ) {
        super();
        const { range } = _option;
        this._range$ = new BehaviorSubject<IRange>(range);
        this.range$ = this._range$.asObservable();

        this._watchRange(range);

        setTimeout(() => {
            this._updateDataSourceByRange(range);
        });
    }

    private _updateDataSourceByRange(range: IRange) {
        const getCellValuesFromRange = (r: IRange) => {
            const { unitId, subUnitId } = this._option;
            const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
            if (!workbook) return;

            const workSheet = workbook?.getSheetBySheetId(subUnitId);
            if (!workSheet) return;

            return workSheet.getRange(r).getValues().map((cells) => cells.map((cell) => cell?.v));
        };
        const rangeValues = getCellValuesFromRange(range);
        rangeValues && this._dataSource$.next(rangeValues);
    }

    private _watchRange(range: IRange) {
        this._watchRangeDisposer?.dispose();
        const { unitId, subUnitId } = this._option;
        this._watchRangeDisposer = this._commandService.onCommandExecuted((command) => {
            if (command.id === SetRangeValuesCommand.id) {
                const { subUnitId: commandSubUnitId, unitId: commandUnitId, range: commandRange } = command.params as ISetRangeValuesCommandParams;
                if (commandSubUnitId === subUnitId
                    && commandUnitId === unitId
                    && commandRange && Rectangle.contains(range, commandRange)
                ) {
                    this._updateDataSourceByRange(this.range);
                }
            }
        });
    }

    setRange(range: IRange) {
        this._range$.next(range);
        this._watchRange(range);
        this._updateDataSourceByRange(range);
    }

    override dispose() {
        super.dispose();
        this._dataSource$.complete();
        this._range$.complete();
        this._watchRangeDisposer?.dispose();
    }
}
