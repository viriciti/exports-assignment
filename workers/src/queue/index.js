const amqp = require('amqplib');

async function listenToQueue (task) {
    const queue = process.env.QUEUE_NAME
    const connection = await amqp.connect(process.env.QUEUE_URI);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: false });

    channel.consume(queue, async (msg) => {
        const content = msg.content.toString();
        await task(content);
        channel.ack(msg);
    });
}

module.exports = { listenToQueue };