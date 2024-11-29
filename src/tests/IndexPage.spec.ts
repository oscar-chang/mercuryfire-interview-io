import { mount, flushPromises } from '@vue/test-utils';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import IndexPage from '../src/pages/IndexPage.vue';

describe('IndexPage.vue', () => {
    let mock: MockAdapter;

    beforeAll(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.reset();
    });

    afterAll(() => {
        mock.restore();
    });

    it('should fetch and render data correctly', async () => {
        // 模擬 API 回應
        mock.onGet('https://dahua.metcfire.com.tw/api/CRUDTest/a').reply(200, [
            { id: 1, name: 'Oscar', age: 39 },
            { id: 2, name: '志偉', age: 30 },
        ]);

        const wrapper = mount(IndexPage);

        // 等待所有請求完成
        await flushPromises();

        // 確認表格渲染資料
        expect(wrapper.findAll('tbody tr').length).toBe(2);
        expect(wrapper.text()).toContain('Oscar');
        expect(wrapper.text()).toContain('志偉');
    });

    it('should validate input before adding', async () => {
        const wrapper = mount(IndexPage);

        // 點擊新增按鈕
        await wrapper.find('button').trigger('click');

        // 確認驗證錯誤訊息
        expect(wrapper.text()).toContain('姓名不得空白');
        expect(wrapper.text()).toContain('年齡不得空白且需為正整數');
    });

    it('should add data correctly', async () => {
        mock.onPost('https://dahua.metcfire.com.tw/api/CRUDTest').reply(201, {
            id: 3,
            name: '新增測試',
            age: 25,
        });

        const wrapper = mount(IndexPage);

        // 填寫表單
        await wrapper.find('input[label="姓名"]').setValue('新增測試');
        await wrapper.find('input[label="年齡"]').setValue('25');
        await wrapper.find('button').trigger('click');

        // 等待所有請求完成
        await flushPromises();

        // 確認表格渲染新增資料
        expect(wrapper.text()).toContain('新增測試');
        expect(wrapper.text()).toContain('25');
    });

    it('should delete data correctly', async () => {
        // 模擬 API 回應
        mock.onGet('https://dahua.metcfire.com.tw/api/CRUDTest/a').reply(200, [
            { id: 1, name: 'Oscar', age: 39 },
        ]);

        mock.onDelete('https://dahua.metcfire.com.tw/api/CRUDTest/1').reply(200);

        const wrapper = mount(IndexPage);

        // 等待資料載入
        await flushPromises();

        // 點擊刪除按鈕
        await wrapper.find('button[icon="delete"]').trigger('click');
        await wrapper.find('button[label="刪除"]').trigger('click');

        // 等待所有請求完成
        await flushPromises();

        // 確認資料已刪除
        expect(wrapper.text()).not.toContain('Oscar');
    });

    it('should update data correctly', async () => {
        // 模擬 API 回應
        mock.onGet('https://dahua.metcfire.com.tw/api/CRUDTest/a').reply(200, [
            { id: 1, name: 'Oscar', age: 39 },
        ]);

        mock.onPatch('https://dahua.metcfire.com.tw/api/CRUDTest').reply(200, {
            id: 1,
            name: '修改測試',
            age: 40,
        });

        const wrapper = mount(IndexPage);

        // 等待資料載入
        await flushPromises();

        // 點擊編輯按鈕
        await wrapper.find('button[icon="edit"]').trigger('click');

        // 修改表單資料
        await wrapper.find('input[label="姓名"]').setValue('修改測試');
        await wrapper.find('input[label="年齡"]').setValue('40');
        await wrapper.find('button').trigger('click');

        // 等待所有請求完成
        await flushPromises();

        // 確認表格渲染更新資料
        expect(wrapper.text()).toContain('修改測試');
        expect(wrapper.text()).toContain('40');
    });
});
