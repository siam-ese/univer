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

import { Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@univerjs/core';
import { SheetsChartUIController } from '../controllers/sheets-chart-ui.controller';
import { SheetsChartUIService } from '../services/sheets-chart-ui.service';

const PLUGIN_NAME = 'UniverSheetsChartUIPlugin';

export class UniverSheetsChartUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = PLUGIN_NAME;

    constructor(@Inject(Injector) protected readonly _injector: Injector) {
        super();
    }

    override onStarting(injector: Injector): void {
        ([
            [SheetsChartUIService],
            [SheetsChartUIController],
        ] as Dependency[]).forEach((d) => injector.add(d));
    }
}
