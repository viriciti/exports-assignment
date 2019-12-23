const amqp = require('amqplib');

async function sendJob (jobId) {
    const queue = process.env.QUEUE_NAME;
    const connection = await amqp.connect(process.env.QUEUE_URI);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: false });

    channel.sendToQueue(queue, Buffer.from(jobId));

    await channel.close();
    await connection.close();
}

module.exports = { sendJob };