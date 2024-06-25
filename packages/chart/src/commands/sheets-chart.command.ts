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

import type { ICommand, IMutation, IRange } from '@univerjs/core';
import { CommandType, ICommandService } from '@univerjs/core';
import { type ISheetCommandSharedParams, SelectionManagerService } from '@univerjs/sheets';

import { SheetsChartService } from '../services/sheets-chart.service';

export interface IInsertChartCommandParams extends ISheetCommandSharedParams {
    range: IRange;
}

export const InsertSheetsChartMutation: IMutation<IInsertChartCommandParams> = {
    id: 'sheet.mutation.insert-chart',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { subUnitId, unitId, range } = params;
        const sheetChartService = accessor.get(SheetsChartService);

        sheetChartService.createChartModel(unitId, subUnitId, range);

        return true;
    },
};

/**
 * It is used to set the bold style of selections or one cell, need to distinguish between
 *  **selection state** and **edit state**. If you are in the selective state,
 *  you need to set the style on the cell and the style on the rich text(p textRuns) at the same time,
 *  and if it is only in edit state, then you only need to set the style of the rich text(p textRuns)
 */
export const InsertChartCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-chart',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        // const univerInstanceService = accessor.get(IUniverInstanceService);
        // const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        // const worksheet = workbook.getActiveSheet();
        const currentSelection = selectionManagerService.getCurrent();
        const range = selectionManagerService.getSelectionRanges()?.[0];
        if (!range) {
            return false;
        }

        const params = {
            unitId: currentSelection?.unitId,
            subUnitId: currentSelection?.sheetId,
            range,
        };
        return commandService.executeCommand(InsertSheetsChartMutation.id, params);
    },
};
