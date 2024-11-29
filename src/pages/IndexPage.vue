<script setup lang="ts">
import axios from 'axios';
import { QTableProps } from 'quasar';
import { ref, onMounted } from 'vue';

interface btnType {
  label: string;
  icon: string;
  status: string;
}

const blockData = ref<Array<{ id: string; name: string; age: number }>>([]);
const tableConfig = ref([
  { label: '姓名', name: 'name', field: 'name', align: 'left' },
  { label: '年齡', name: 'age', field: 'age', align: 'left' },
]);

const tableButtons = ref<btnType[]>([
  { label: '編輯', icon: 'edit', status: 'edit' },
  { label: '刪除', icon: 'delete', status: 'delete' },
]);

const tempData = ref({
  name: '',
  age: '',
});
const isEditing = ref(false); // 是否處於編輯模式
const originalName = ref(''); // 用來記錄原始姓名（用於修改時匹配）

/** 初始化數據 */
async function fetchData() {
  try {
    const response = await axios.get('https://dahua.metcfire.com.tw/api/CRUDTest/All');
    blockData.value = response.data || [];
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

/** 新增或修改資料 */
async function saveRow() {
  if (!tempData.value.name || !tempData.value.age) {
    alert('請填寫完整資料');
    return;
  }

  if (isEditing.value) {
    // 修改資料
    try {
      const response = await axios.post(
        `https://dahua.metcfire.com.tw/api/CRUDTest/update/${tempData.value.id}`, // 動態替換 {id}
        { ...tempData.value } // 將資料直接傳遞
      );
      if (response.data.success) {
        // 更新本地資料
        const index = blockData.value.findIndex((item) => item.id === tempData.value.id);
        if (index !== -1) {
          blockData.value[index] = { ...tempData.value };
        }
        resetForm();
      } else {
        alert('修改資料失敗！');
      }
    } catch (error) {
      console.error('Error updating data:', error);
    }
  } else {
    // 新增資料
    try {
      const response = await axios.post(
        'https://dahua.metcfire.com.tw/api/CRUDTest/add',
        { ...tempData.value }
      );
      if (response.data.success) {
        blockData.value.push({ ...tempData.value, id: response.data.id }); // 假設後端返回 id
        resetForm();
      } else {
        alert('新增資料失敗！');
      }
    } catch (error) {
      console.error('Error adding data:', error);
    }
  }
}


/** 刪除資料 */
async function deleteData(id: string) {
  try {
    const response = await axios.post('https://dahua.metcfire.com.tw/api/CRUDTest/', { id });
    if (response.data.success) {
      // 使用 ID 過濾掉已刪除的資料
      blockData.value = blockData.value.filter((item) => item.id !== id);
    } else {
      alert('刪除資料失敗！');
    }
  } catch (error) {
    console.error('Error deleting data:', error);
  }
}


function handleClickOption(btn: btnType, data: any) {
  if (btn.status === 'edit') {
    tempData.value = { ...data };
    originalName.value = data.name; // 記錄原始姓名
    isEditing.value = true; // 切換為編輯模式
  } else if (btn.status === 'delete') {
    deleteData(data.id); // 使用字串 ID 進行刪除
  }
}


/** 重置表單 */
function resetForm() {
  tempData.value = { name: '', age: '' };
  isEditing.value = false;
  originalName.value = '';
}

/** 初始化資料加載 */
onMounted(() => {
  fetchData();
});
</script>

<template>
  <q-page class="row q-pt-xl">
    <div class="full-width q-px-xl">
      <!-- 表單 -->
      <div class="q-mb-xl form-section">
        <q-input v-model="tempData.name" label="姓名" outlined dense />
        <q-input v-model="tempData.age" label="年齡" outlined dense type="number" />
        <q-btn
          color="primary"
          class="q-mt-md"
          @click="saveRow"
        >
          {{ isEditing ? '修改' : '新增' }}
        </q-btn>
        <q-btn
          v-if="isEditing"
          color="grey"
          class="q-mt-md q-ml-sm"
          @click="resetForm"
        >
          取消編輯
        </q-btn>
      </div>

      <!-- 表格 -->
      <q-table
        flat
        bordered
        ref="tableRef"
        :rows="blockData"
        :columns="(tableConfig as QTableProps['columns'])"
        row-key="name"
        hide-pagination
        separator="cell"
        :rows-per-page-options="[0]"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
            <q-th></q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="min-width: 120px"
            >
              <div>{{ props.row[col.name] }}</div>
            </q-td>
            <q-td class="text-right" auto-width v-if="tableButtons.length > 0">
              <q-btn
                v-for="(btn, index) in tableButtons"
                :key="index"
                size="sm"
                color="grey-6"
                round
                dense
                :icon="btn.icon"
                class="q-ml-md"
                @click="handleClickOption(btn, props.row)"
              >
                <q-tooltip
                  transition-show="scale"
                  transition-hide="scale"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                >
                  {{ btn.label }}
                </q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data="{ icon }">
          <div
            class="full-width row flex-center items-center text-primary q-gutter-sm"
            style="font-size: 18px"
          >
            <q-icon size="2em" :name="icon" />
            <span> 無相關資料 </span>
          </div>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
/* 表單區域樣式 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.q-input {
  width: 100%;
}

.q-btn {
  align-self: flex-start;
}

/* 表格樣式 */
.q-table th {
  font-size: 20px;
  font-weight: bold;
}

.q-table tbody td {
  font-size: 18px;
}

.q-btn {
  margin: 0 5px;
}
</style>
