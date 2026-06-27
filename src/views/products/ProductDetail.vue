<template>
  <div class="product-detail">
    <div class="comments-section">
      <h3>商品留言</h3>
      <div v-for="c in comments" :key="c.id" class="comment-item">
        <span class="user">{{ c.userNickname }}</span>：
        <span>{{ c.content }}</span>
        <span class="time">{{ new Date(c.createdAt).toLocaleString() }}</span>
      </div>
      <div v-if="!comments.length">暂无留言</div>

      <el-input
        v-model="newComment"
        placeholder="输入留言，按回车发送"
        @keyup.enter="postComment"
        clearable
        style="margin-top:10px"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getComments, addComment } from '@/api/comments';
import { ElMessage } from 'element-plus';

const route = useRoute();
const productId = parseInt(route.params.id);
const comments = ref([]);
const newComment = ref('');

async function fetchComments() {
  try {
    const { data } = await getComments(productId, { page: 1, limit: 50 });
    comments.value = data.comments;
  } catch (e) {
    ElMessage.error('加载留言失败');
  }
}

async function postComment() {
  if (!newComment.value.trim()) return;
  try {
    await addComment(productId, newComment.value.trim());
    newComment.value = '';
    fetchComments();
  } catch (e) {
    ElMessage.error('发送留言失败');
  }
}

onMounted(fetchComments);
</script>

<style scoped>
.comments-section {
  margin-top: 30px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}
.comment-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.time {
  float: right;
  color: #999;
  font-size: 12px;
}
</style>
