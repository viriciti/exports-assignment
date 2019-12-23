const amqp = require('amqplib');

async function listenToQueue (task) {
    const queue = process.env.QUEUE_NAME || 'test';
    const connection = await amqp.connect(process.env.QUEUE_URI || 'amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: false });

    channel.consume(queue, async (msg) => {
        const content = msg.content.toString();
        await task(content);
        channel.ack(msg);
    });
}

module.exports = { listenToQueue };