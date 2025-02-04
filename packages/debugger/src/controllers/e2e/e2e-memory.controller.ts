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

import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { UniverType } from '@univerjs/protocol';
import { DisposeUniverCommand } from '../../commands/commands/unit.command';
import { getDefaultWorkbookData } from './data/default-sheet';
import { getDefaultDocData } from './data/default-doc';

const AWAIT_LOADING_TIMEOUT = 5000;
const AWAIT_DISPOSING_TIMEOUT = 5000;

// NOTE: this interface is copied to `e2e/e2e.d.ts`. When you modify this interface, make sure
// the duplication is updated as well.
export interface IE2EControllerAPI {
    loadAndRelease(id: number, loadTimeout?: number, disposeTimeout?: number): Promise<void>;
    loadDefaultSheet(loadTimeout?: number): Promise<void>;
    loadDefaultDoc(loadTimeout?: number,): Promise<void>;
    disposeUniver(): Promise<void>;
    disposeCurrSheetUnit(disposeTimeout?: number): Promise<void>;
}

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        E2EControllerAPI: IE2EControllerAPI;
    }
}

/**
 * This controller expose a API on `Window` for the E2E memory test.
 */
@OnLifecycle(LifecycleStages.Starting, E2EMemoryController)
export class E2EMemoryController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initPlugin();
    }

    override dispose(): void {
        // @ts-ignore
        window.E2EControllerAPI = undefined;
    }

    private _initPlugin(): void {
        window.E2EControllerAPI = {
            loadAndRelease: (id, loadTimeout, disposeTimeout) => this._loadAndRelease(id, loadTimeout, disposeTimeout),
            loadDefaultSheet: (loadTimeout) => this._loadDefaultSheet(loadTimeout),
            disposeCurrSheetUnit: (disposeTimeout?: number) => this._diposeDefaultSheetUnit(disposeTimeout),
            loadDefaultDoc: (loadTimeout) => this._loadDefaultDoc(loadTimeout),
            disposeUniver: () => this._disposeUniver(),
        };
    }

    private async _loadAndRelease(releaseId: number, loadingTimeout: number = AWAIT_LOADING_TIMEOUT, disposingTimeout: number = AWAIT_DISPOSING_TIMEOUT): Promise<void> {
        const unitId = `e2e${releaseId}`;
        const snapshot = getDefaultWorkbookData();
        snapshot.id = unitId;

        this._univerInstanceService.createUnit(UniverInstanceType.UNIVER_SHEET, snapshot);
        await timer(loadingTimeout);

        this._univerInstanceService.disposeUnit(unitId);
        await timer(disposingTimeout);
    }

    private async _loadDefaultSheet(loadingTimeout: number = AWAIT_LOADING_TIMEOUT): Promise<void> {
        this._univerInstanceService.createUnit(UniverInstanceType.UNIVER_SHEET, getDefaultWorkbookData());
        await timer(loadingTimeout);
    }

    private async _loadDefaultDoc(loadingTimeout: number = AWAIT_LOADING_TIMEOUT): Promise<void> {
        this._univerInstanceService.createUnit(UniverInstanceType.UNIVER_DOC, getDefaultDocData());
        await timer(loadingTimeout);
    }

    private async _disposeUniver(): Promise<void> {
        await this._commandService.executeCommand(DisposeUniverCommand.id);
    }

    private async _diposeDefaultSheetUnit(disposingTimeout: number = AWAIT_DISPOSING_TIMEOUT): Promise<void> {
        const unit = this._univerInstanceService.getCurrentUnitForType(UniverType.UNIVER_SHEET);
        const unitId = unit?.getUnitId();
        await this._univerInstanceService.disposeUnit(unitId || '');
        await timer(disposingTimeout);
    }
}

function timer(timeout: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}
