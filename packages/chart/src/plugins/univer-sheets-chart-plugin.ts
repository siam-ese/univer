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

import type { Dependency } from '@univerjs/core';
import { Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { SheetsChartService } from '../services/sheets-chart.service';
import { SheetsChartController } from '../controllers/sheets-chart.controller';
// import type { IChartInjector } from '../chart-injectors/line-chart-injector';
// import type { IChartInstanceConstructor } from '../chart-render/render-engine';
import { SheetsChartRenderService } from '../services/sheets-chart-render.service';
import { SheetsChartConfigService } from '../services/sheets-chart-config.service';
import { IChartHostProvider } from '../services/chart-host-provider';
import { SheetsChartHostProvider } from '../services/sheets-chart-host-provider';

export const SHEETS_CHART_PLUGIN_NAME = 'SHEET_CHART_PLUGIN';

export interface IUniverSheetsChartPluginConfig {
    // renderEngines: Record<string, IChartInstanceConstructor>;
    // injectors: IChartInjector[];
}

export class UniverSheetsChartPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = SHEETS_CHART_PLUGIN_NAME;

    constructor(private readonly _config: IUniverSheetsChartPluginConfig, @Inject(Injector) protected readonly _injector: Injector) {
        super();
    }

    override onStarting(): void {
        const { _injector } = this;
        ([
            [SheetsChartConfigService],
            [SheetsChartRenderService],
            [SheetsChartService],
            [SheetsChartController],
            [IChartHostProvider, { useClass: SheetsChartHostProvider }],
        ] as Dependency[]).forEach((d) => _injector.add(d));

        // const sheetsChartService = _injector.get(SheetsChartService);
        // const sheetsRenderService = _injector.get(SheetsChartRenderService);

        // const { renderEngines } = this._config;
        // Register render engine
        // Object.keys(renderEngines).forEach((name) => {
            // sheetsRenderService.registerRenderEngine(name, renderEngines[name]);
        // });

        // Add injector after render engine initiated
        // injectors.forEach((injector) => {
        //     sheetsChartService.addInjector(injector);
        // });
    }
}
