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

import type { ICommand, IMutation, IRange, Workbook } from '@univerjs/core';
import { CommandType, ICommandService, IUniverInstanceService, RANGE_TYPE, UniverInstanceType } from '@univerjs/core';
import { type ISheetCommandSharedParams, SheetsSelectionsService } from '@univerjs/sheets';

import { SheetsChartService } from '../services/sheets-chart.service';

export interface IInsertChartCommandParams extends ISheetCommandSharedParams {
    range: IRange;
}

export const InsertSheetsChartMutation: IMutation<IInsertChartCommandParams> = {
    id: 'sheet.mutation.insert-chart',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, subUnitId, range } = params;

        const sheetChartService = accessor.get(SheetsChartService);

        sheetChartService.createChartModel(unitId, subUnitId, range);

        return true;
    },
};

/**
 */
export const InsertChartCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-chart',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const unitId = workbook?.getUnitId();
        const subUnitId = workbook?.getActiveSheet().getSheetId();

        selectionManagerService.setSelections([
            {
                range: {
                    startRow: 13,
                    startColumn: 0,
                    endRow: 22,
                    endColumn: 4,
                    rangeType: RANGE_TYPE.NORMAL,
                },
                style: null,
                primary: null,
            },
        ]);
        const [currentSelection] = selectionManagerService.getCurrentSelections();

        const range = currentSelection.range;
        if (!range) {
            return false;
        }

        const params = {
            unitId,
            subUnitId,
            range,
        };
        return commandService.executeCommand(InsertSheetsChartMutation.id, params);
    },
};
