// src/index.js

// 1. تحميل الحزم ومتغيرات البيئة
import dotenv from 'dotenv';
dotenv.config(); // لتحميل متغيرات البيئة من ملف .env
import express from 'express';
import { Pool } from 'pg'; // لتحميل مكتبة PostgreSQL
import cors from 'cors'; // لتحميل مكتبة CORS للسماح بالوصول من مصادر مختلفة
// 2. إعداد سيرفر Express
const app = express();
app.use(cors()); // للسماح بالوصول من مصادر مختلفة
const port = process.env.PORT || 3000;
app.use(express.json()); // للسماح للسيرفر بفهم بيانات JSON

// 3. إعداد الاتصال بقاعدة البيانات
const pool = new Pool({
  // Railway يوفر هذا المتغير تلقائيًا ويحتوي على كل معلومات الاتصال
  connectionString: process.env.DATABASE_URL,
  // هذا السطر ضروري جدًا للاتصال بقواعد البيانات على الخدمات السحابية مثل Railway
  ssl: {
    rejectUnauthorized: false
  }
});;

// 4. إنشاء نقطة API (Route) تجريبية للتأكد من أن السيرفر يعمل
app.get('/', (req, res) => {
  res.send('Todo API is running!');
});

app.get('/todos', async (req, res) => {
  try {
    // تنفيذ استعلام لجلب كل الصفوف من جدول todos
    const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    // إرسال النتيجة كبيانات JSON مع حالة نجاح 200
    res.status(200).json(result.rows);
  } catch (error) {
    // في حالة حدوث خطأ، يتم طباعته وإرسال خطأ 500
    console.error('Error fetching todos', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/todos', async (req, res) => {
  try {
    // 1. استخلاص نص المهمة من جسم الطلب (request body)
    const { task } = req.body;

    // 2. التحقق من أن نص المهمة موجود
    if (!task) {
      return res.status(400).json({ error: 'Task text is required' });
    }

    // 3. تنفيذ استعلام لإضافة المهمة إلى قاعدة البيانات
    // استخدام ($1) يحمي من ثغرات SQL Injection
    const newTodo = await pool.query(
      'INSERT INTO todos (task) VALUES ($1) RETURNING *',
      [task]
    );

    // 4. إرسال المهمة الجديدة التي تم إنشاؤها مع حالة نجاح 201
    res.status(201).json(newTodo.rows[0]);
  } catch (error) {
    console.error('Error creating todo', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// TODO: سنضيف هنا نقاط الـ API الخاصة بالمهام لاحقًا
app.put('/todos/:id', async (req, res) => {
  try {
    // 1. استخلاص id المهمة من الرابط، والبيانات الجديدة من جسم الطلب
    const { id } = req.params;
    const { task, is_completed } = req.body;

    // 2. التحقق من وجود البيانات المطلوبة
    if (task === undefined || is_completed === undefined) {
      return res.status(400).json({ error: 'Task text and completion status are required' });
    }

    // 3. تنفيذ استعلام لتحديث المهمة في قاعدة البيانات
    const updatedTodo = await pool.query(
      'UPDATE todos SET task = $1, is_completed = $2 WHERE id = $3 RETURNING *',
      [task, is_completed, id]
    );

    // 4. التحقق مما إذا كانت المهمة موجودة أم لا
    if (updatedTodo.rowCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // 5. إرسال المهمة بعد تعديلها مع حالة نجاح 200
    res.status(200).json(updatedTodo.rows[0]);
  } catch (error) {
    console.error('Error updating todo', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.patch('/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { task, is_completed } = req.body;

        // جلب المهمة الحالية من قاعدة البيانات
        const currentTodoResult = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
        if (currentTodoResult.rowCount === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        const currentTodo = currentTodoResult.rows[0];

        // تحديث الحقول فقط إذا تم إرسالها في الطلب
        const newTask = task !== undefined ? task : currentTodo.task;
        const newStatus = is_completed !== undefined ? is_completed : currentTodo.is_completed;

        // تنفيذ استعلام التحديث
        const updatedTodo = await pool.query(
            'UPDATE todos SET task = $1, is_completed = $2 WHERE id = $3 RETURNING *',
            [newTask, newStatus, id]
        );

        res.status(200).json(updatedTodo.rows[0]);
    } catch (error) {
        console.error('Error partially updating todo', error.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleteOp = await pool.query('DELETE FROM todos WHERE id = $1', [id]);

    // التحقق مما إذا كانت المهمة موجودة أصلًا
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // إرسال رد ناجح بدون محتوى (الحالة 204 هي المتعارف عليها لعمليات الحذف الناجحة)
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting todo', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// 5. تشغيل السيرفر
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
