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

import { Disposable, IResourceManagerService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { RefRangeService } from '@univerjs/sheets';
import { SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { Inject } from '@wendellhu/redi';

export const SHEET_CHART_PLUGIN = 'SHEET_CHART_PLUGIN';

@OnLifecycle(LifecycleStages.Rendered, SheetsChartUIService)
export class SheetsChartUIService extends Disposable {
    constructor(
        @Inject(SheetCanvasFloatDomManagerService) private readonly _sheetCanvasFloatDomManagerService: SheetCanvasFloatDomManagerService,
        @IResourceManagerService private readonly _resourcesManagerService: IResourceManagerService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
    }

    override dispose() {
        super.dispose();
    }
}
