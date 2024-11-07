import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {LocalMessageQueue} from "../distribution/impl/LocalMessageQueue.mjs";
import sinon from "sinon";

const {
    expect,
    it,
    beforeEach,
    afterEach,
    describe
} = setupTestContext();


describe('LocalMessageQueue', () => {
    let messageQueue;

    beforeEach(() => {
        messageQueue = new LocalMessageQueue();
    });

    afterEach(() => {
        messageQueue.clearProcess();
    });

    it('should start with a ready state', async () => {
        const ready = await messageQueue.waitReady();
        expect(ready).to.be.true;
    });

    it('should not accept jobs when the queue is not open', async () => {
        await messageQueue.close();
        try {
            await messageQueue.submit('job1', { data: 'test' });
            throw new Error('Job submission should have thrown an error');
        } catch (err) {
            expect(err.message).to.equal('Job queue not opened');
        }
    });

    it('should accept jobs when the queue is open', async () => {
        await messageQueue.open();
        await messageQueue.submit('job1', { data: 'test' });
        await messageQueue.submit('job2', { data: 'test' });
        await messageQueue.submit('job3', { data: 'test' });
        await messageQueue.submit('job4', { data: 'test' });
        const jobCount = await messageQueue.getJobCount();
        expect(jobCount.waiting).to.equal(4);
    });

    it('should pause and resume job processing', async () => {
        await messageQueue.open();
        messageQueue.pause();

        const listener = sinon.spy();
        await messageQueue.process('job1', listener);

        await messageQueue.submit('job1', { data: 'test' });
        const jobCount = await messageQueue.getJobCount();
        expect(jobCount.waiting).to.equal(1);
        expect(jobCount.active).to.equal(0);

        messageQueue.resume();
        await new Promise((resolve) => setTimeout(resolve, 150)); // Wait for job to process
        expect(listener.calledOnce).to.be.true;
    });

    it('should process jobs in the order they are submitted', async () => {
        await messageQueue.open();
        const processedJobs = [];

        await messageQueue.process('job1', (job) => {
            processedJobs.push(job.name);
            return 'result1';
        });

        await messageQueue.process('job2', (job) => {
            processedJobs.push(job.name);
            return 'result2';
        });

        await messageQueue.submit('job1', { data: 'data1' });
        await messageQueue.submit('job2', { data: 'data2' });

        await new Promise((resolve) => setTimeout(resolve, 150)); // Wait for jobs to process

        expect(processedJobs).to.eql(['job1', 'job2']);
    });

    it('should abort jobs', async () => {
        await messageQueue.open();

        const listener = sinon.spy();
        await messageQueue.process('job1', listener);

        await messageQueue.submit('job1', { data: 'test' });
        messageQueue.abort('job1');

        await new Promise((resolve) => setTimeout(resolve, 150)); // Wait for job to process

        expect(listener.called).to.be.false;
    });

    it('should throw an error if trying to process with an existing listener', async () => {
        await messageQueue.open();

        await messageQueue.process('job1', () => 'result1');

        try {
            await messageQueue.process('job1', () => 'result2');
            throw new Error('Processing with multiple listeners should have thrown an error');
        } catch (err) {
            expect(err.message).to.equal('Only one worker for type job1 is allowed');
        }
    });

    it('should clear all jobs in the queue when obliterate is called', async () => {
        await messageQueue.open();
        await messageQueue.submit('job1', { data: 'test' });

        const jobCountBefore = await messageQueue.getJobCount();
        expect(jobCountBefore.active).to.equal(0);
        expect(jobCountBefore.waiting).to.equal(1);

        messageQueue.obliterate();

        const jobCountAfter = await messageQueue.getJobCount();
        expect(jobCountAfter.active).to.equal(0);
        expect(jobCountAfter.waiting).to.equal(0);
    });
});
