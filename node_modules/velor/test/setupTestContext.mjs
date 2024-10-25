import {
    config,
    expect,
    use
} from "chai";
import chaiExclude from "chai-exclude";
import chaiAsPromised from "chai-as-promised";
import {test as baseTest} from "@playwright/test";
import {waitOnAsync} from "./waitOnAsync.mjs";

config.truncateThreshold = 0
config.showDiff = true;
use(chaiExclude);
use(chaiAsPromised);

export const test = baseTest;

export function setupTestContext() {
    return {
        test,
        it: test,
        describe: test.describe,
        beforeEach: test.beforeEach,
        afterEach: test.afterEach,
        afterAll: test.afterAll,
        beforeAll: test.beforeAll,
        expect,
        waitOnAsync
    }
}