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

import type { TextXAction } from '@univerjs/core';
import { TextXActionType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';

import { TextX } from '../text-x';

describe('transformPosition()', () => {
    it('insert before position', () => {
        const actions = [
            {
                t: TextXActionType.INSERT,
                len: 1,
                line: 0,
                body: {
                    dataStream: 'h',
                },
            },
        ];
        expect(TextX.transformPosition(actions, 2)).toEqual(3);
    });

    it('insert after position', () => {
        const actions: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                segmentId: '',
                len: 1,
            },
            {
                t: TextXActionType.INSERT,
                len: 1,
                line: 0,
                body: {
                    dataStream: 'h',
                },
            },
        ];
        expect(TextX.transformPosition(actions, 0)).toEqual(0);
    });

    it('insert at position', () => {
        const actions: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                segmentId: '',
                len: 1,
            },
            {
                t: TextXActionType.INSERT,
                len: 1,
                line: 0,
                body: {
                    dataStream: 'h',
                },
            },
        ];

        expect(TextX.transformPosition(actions, 1, true)).toEqual(1);
        expect(TextX.transformPosition(actions, 1, false)).toEqual(2);
    });

    it('delete before position', () => {
        const actions: TextXAction[] = [
            {
                t: TextXActionType.DELETE,
                segmentId: '',
                len: 1,
                line: 0,
            },
        ];

        expect(TextX.transformPosition(actions, 3)).toEqual(2);
    });

    it('delete after position', () => {
        const actions: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                segmentId: '',
                len: 5,
            },
            {
                t: TextXActionType.DELETE,
                segmentId: '',
                len: 1,
                line: 0,
            },
        ];

        expect(TextX.transformPosition(actions, 3)).toEqual(3);
    });

    it('delete across position', () => {
        const actions: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                segmentId: '',
                len: 1,
            },
            {
                t: TextXActionType.DELETE,
                segmentId: '',
                len: 5,
                line: 0,
            },
        ];

        expect(TextX.transformPosition(actions, 3)).toEqual(1);
    });

    it('insert and delete before position', () => {
        const actions: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                segmentId: '',
                len: 2,
            },
            {
                t: TextXActionType.INSERT,
                len: 1,
                line: 0,
                body: {
                    dataStream: 'h',
                },
            },
            {
                t: TextXActionType.DELETE,
                segmentId: '',
                len: 2,
                line: 0,
            },
        ];

        expect(TextX.transformPosition(actions, 4)).toEqual(3);
    });

    it('insert before and delete across position', () => {
        const actions: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                segmentId: '',
                len: 2,
            },
            {
                t: TextXActionType.INSERT,
                len: 1,
                line: 0,
                body: {
                    dataStream: 'h',
                },
            },
            {
                t: TextXActionType.DELETE,
                segmentId: '',
                len: 4,
                line: 0,
            },
        ];

        expect(TextX.transformPosition(actions, 4)).toEqual(3);
    });

    it('delete before and delete across position', () => {
        const actions: TextXAction[] = [
            {
                t: TextXActionType.DELETE,
                segmentId: '',
                len: 1,
                line: 0,
            },
            {
                t: TextXActionType.RETAIN,
                segmentId: '',
                len: 1,
            },
            {
                t: TextXActionType.DELETE,
                segmentId: '',
                len: 4,
                line: 0,
            },
        ];

        expect(TextX.transformPosition(actions, 4)).toEqual(1);
    });
});
