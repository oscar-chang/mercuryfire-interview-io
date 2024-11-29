<template>
  <q-page class="row q-pt-xl">
    <div class="full-width q-px-xl">
      <!-- 表單區域 -->
      <div class="q-mb-xl form-section">
        <q-input
          v-model="tempData.name"
          label="姓名"
          outlined
          dense
          :error="!tempData.name && hasSubmitted"
          error-message="姓名不得空白"
        />
        <q-input
          v-model="tempData.age"
          label="年齡"
          outlined
          dense
          type="number"
          :error="!isAgeValid && hasSubmitted"
          error-message="年齡不得空白且需為正整數"
        />
        <q-btn
          :label="isEditMode ? '更新' : '新增'"
          color="primary"
          class="q-mt-md"
          @click="handleSubmit"
        />
      </div>

      <!-- 表格區域 -->
      <q-table
        flat
        bordered
        ref="tableRef"
        :rows="blockData"
        :columns="(tableConfig as QTableProps['columns'])"
        row-key="id"
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
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <div>{{ props.row[col.name] }}</div>
            </q-td>
            <q-td class="text-right" auto-width>
              <q-btn
                size="sm"
                color="grey-6"
                round
                dense
                icon="edit"
                @click="prepareEdit(props.row)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                size="sm"
                color="negative"
                round
                dense
                icon="delete"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data>
          <div class="full-width row flex-center items-center text-primary q-gutter-sm" style="font-size: 18px">
            <q-icon size="2em" name="warning" />
            <span>無相關資料</span>
          </div>
        </template>
      </q-table>
    </div>

    <!-- 刪除確認對話框 -->
    <q-dialog v-model="deleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">確認刪除</div>
        </q-card-section>
        <q-card-section>
          <p>是否確定要刪除該筆資料？</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="刪除" color="negative" @click="deleteData" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

// 資料與狀態
const blockData = ref([]);
const tableConfig = ref([
  { label: '姓名', name: 'name', field: 'name', align: 'left' },
  { label: '年齡', name: 'age', field: 'age', align: 'left' },
]);

const tempData = ref({ id: null, name: '', age: '' });
const deleteDialog = ref(false);
const deleteTarget = ref(null);
const hasSubmitted = ref(false);
const isEditMode = ref(false);

// 驗證邏輯
const isAgeValid = computed(() => {
  return tempData.value.age && /^\d+$/.test(tempData.value.age);
});

// API 呼叫
const fetchData = async () => {
  try {
    const response = await axios.get('https://dahua.metcfire.com.tw/api/CRUDTest/a');
    blockData.value = response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const addData = async () => {
  try {
    const response = await axios.post('https://dahua.metcfire.com.tw/api/CRUDTest', tempData.value);
    blockData.value.push(response.data);
    resetForm();
  } catch (error) {
    console.error('Error adding data:', error);
  }
};

const updateData = async () => {
  try {
    await axios.patch('https://dahua.metcfire.com.tw/api/CRUDTest', tempData.value);
    const index = blockData.value.findIndex((item) => item.id === tempData.value.id);
    blockData.value[index] = { ...tempData.value };
    resetForm();
  } catch (error) {
    console.error('Error updating data:', error);
  }
};

const deleteData = async () => {
  try {
    await axios.delete(`https://dahua.metcfire.com.tw/api/CRUDTest/${deleteTarget.value.id}`);
    blockData.value = blockData.value.filter((item) => item.id !== deleteTarget.value.id);
    deleteDialog.value = false;
  } catch (error) {
    console.error('Error deleting data:', error);
  }
};

// 動作處理
const handleSubmit = () => {
  hasSubmitted.value = true;
  if (!tempData.value.name || !isAgeValid.value) return;

  if (isEditMode.value) {
    updateData();
  } else {
    addData();
  }
};

const prepareEdit = (row) => {
  isEditMode.value = true;
  tempData.value = { ...row };
};

const confirmDelete = (row) => {
  deleteTarget.value = row;
  deleteDialog.value = true;
};

const resetForm = () => {
  tempData.value = { id: null, name: '', age: '' };
  isEditMode.value = false;
  hasSubmitted.value = false;
};

// 初始查詢資料
onMounted(fetchData);
</script>

<style lang="scss" scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.q-btn {
  align-self: flex-start;
}

.q-table th {
  font-size: 20px;
  font-weight: bold;
}

.q-table tbody td {
  font-size: 18px;
}

.q-dialog {
  max-width: 400px;
}
</style>
