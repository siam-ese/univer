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

import {
    DependentOn,
    ICommandService,
    IConfigService,
    Plugin,
    UniverInstanceType,
} from '@univerjs/core';
import { type Dependency, Inject, Injector } from '@univerjs/core';
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { SheetsDataValidationRenderController } from './controllers/dv-render.controller';
import { DataValidationController } from './controllers/dv.controller';
import { DataValidationAlertController } from './controllers/dv-alert.controller';
import { AddSheetDataValidationAndOpenCommand, AddSheetDataValidationCommand, UpdateSheetDataValidationOptionsCommand, UpdateSheetDataValidationRangeCommand, UpdateSheetDataValidationSettingCommand } from './commands/commands/data-validation.command';
import { DataValidationCacheService } from './services/dv-cache.service';
import { DataValidationFormulaService } from './services/dv-formula.service';
import { DataValidationCustomFormulaService } from './services/dv-custom-formula.service';
import { DataValidationRefRangeController } from './controllers/dv-ref-range.controller';
import { DATA_VALIDATION_PLUGIN_NAME } from './common/const';
import { DataValidationAutoFillController } from './controllers/dv-auto-fill.controller';
import { DataValidationCopyPasteController } from './controllers/dv-copy-paste.controller';
import { DataValidationModelController } from './controllers/dv-model.controller';
import { DataValidationDropdownManagerService } from './services/dropdown-manager.service';
import { CloseValidationPanelOperation, HideDataValidationDropdown, OpenValidationPanelOperation, ShowDataValidationDropdown, ToggleValidationPanelOperation } from './commands/operations/data-validation.operation';
import { DataValidationRejectInputController } from './controllers/dv-reject-input.controller';
import { DataValidationPanelService } from './services/data-validation-panel.service';
import { DataValidationFormulaController } from './controllers/dv-formula.controller';
import { DataValidationPermissionController } from './controllers/dv-permission.controller';
import { SheetsDataValidationValidatorService } from './services/dv-validator-service';
import type { IUniverSheetsDataValidationConfig } from './controllers/config.schema';
import { defaultPluginConfig, PLUGIN_CONFIG_KEY } from './controllers/config.schema';

@DependentOn(UniverDataValidationPlugin, UniverSheetsPlugin, UniverSheetsUIPlugin)
export class UniverSheetsDataValidationPlugin extends Plugin {
    static override pluginName = DATA_VALIDATION_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsDataValidationConfig> = defaultPluginConfig,
        @Inject(Injector) protected _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = this._config;
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting() {
        ([
            [DataValidationPanelService],
            [DataValidationCacheService],
            [DataValidationFormulaService],
            [DataValidationCustomFormulaService],
            [DataValidationDropdownManagerService],
            [SheetsDataValidationValidatorService],

            // controller
            [DataValidationModelController],
            [DataValidationController],
            [SheetsDataValidationRenderController],
            [DataValidationAlertController],
            [DataValidationRefRangeController],
            [DataValidationPermissionController],
            [DataValidationAutoFillController],
            [DataValidationCopyPasteController],
            [DataValidationFormulaController],
            [DataValidationRejectInputController],
        ] as Dependency[]).forEach((dep) => {
            this._injector.add(dep);
        });

        [
            AddSheetDataValidationCommand,
            AddSheetDataValidationAndOpenCommand,
            UpdateSheetDataValidationRangeCommand,
            UpdateSheetDataValidationSettingCommand,
            UpdateSheetDataValidationOptionsCommand,

             // operation
            ShowDataValidationDropdown,
            HideDataValidationDropdown,
            CloseValidationPanelOperation,
            OpenValidationPanelOperation,
            ToggleValidationPanelOperation,
        ].forEach((command) => {
            this._commandService.registerCommand(command);
        });
    }
}
