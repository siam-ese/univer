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

import { SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { Disposable, Inject, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Subject } from 'rxjs';
import type { IChartHostProvider } from './chart-host-provider';

function waitElement(id: string) {
    return new Promise<HTMLElement>((resolve) => {
        const timer = setInterval(() => {
            const el = document.getElementById(id);
            if (el) {
                clearInterval(timer);
                resolve(el);
            }
        }, 1000 / 60);
    });
}

@OnLifecycle(LifecycleStages.Rendered, SheetsChartHostProvider)
export class SheetsChartHostProvider extends Disposable implements IChartHostProvider {
    private _removeHost$ = new Subject<string>();
    readonly removeHost$ = this._removeHost$.asObservable();
    constructor(
        @Inject(SheetCanvasFloatDomManagerService) private readonly _sheetCanvasFloatDomManagerService: SheetCanvasFloatDomManagerService
    ) {
        super();
    }

    getHostElement(id: string) {
        return document.getElementById(id);
    }

    createHost(id: string) {
        const { _sheetCanvasFloatDomManagerService } = this;
        const _createHost = (_id: string) => {
            const width = 468;
            const height = 369;
            const floatDom = _sheetCanvasFloatDomManagerService.addFloatDomToPosition({
                allowTransform: true,
                initPosition: {
                    startX: 200,
                    endX: 200 + width,
                    startY: 200,
                    endY: 200 + height,
                },
                componentKey: 'Chart',
            }, _id);

            if (!floatDom) {
                throw new Error('Fail to create float dom');
            }

            const mountNode = document.createElement('div');
            mountNode.style.width = `${width - 2}px`;
            mountNode.style.height = `${height - 2}px`;
            mountNode.style.marginTop = '3px';
            mountNode.style.marginLeft = '3px';
            mountNode.style.border = '1px solid transparent';
            mountNode.style.boxSizing = 'border-box';

            waitElement(floatDom.id).then((el) => {
                el.style.padding = '1px';
                el.appendChild(mountNode);
            });

            this.disposeWithMe(_sheetCanvasFloatDomManagerService.remove$.subscribe((params) => {
                if (params.id === floatDom.id) {
                    this._removeHost$.next(floatDom.id);
                }
            }));

            return {
                id: mountNode,
                dispose: () => floatDom.dispose(),
            };
        };
        const host = _createHost(id);

        this.disposeWithMe(host.dispose);

        return host;
    }
}
