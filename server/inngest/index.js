import { Inngest } from "inngest";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import sendEmail from "../configs/nodeMailer.js";
import Story from "../models/Story.js";
import Message from "../models/Message.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "vible-app" });

// Injest to save user data in database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const {id, first_name, last_name, email_addresses, image_url} = event.data;
    let username = email_addresses[0].email_address.split('@')[0];

    // Check username availability
    const user = await User.findOne({username});

    if(user){
        username = username + Math.floor(Math.random() * 10000);
    }

    const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        full_name: first_name + ' ' + last_name,
        profile_picture: image_url,
        username
    }

    await User.create(userData);
  }
);

// Injest to update user data in database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const {id, first_name, last_name, email_addresses, image_url} = event.data;

    const updatedUserData = {
        email: email_addresses[0].email_address,
        full_name: first_name + ' ' + last_name,
        profile_picture: image_url,
    }

    await User.findByIdAndUpdate(id, updatedUserData);
  }
);

// Injest to delete user data in database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.delete" },
  async ({ event }) => {
    const {id} = event.data;

    await User.findByIdAndDelete(id);
  }
);

// Injest function to send Reminder when a new connection request is added
const sendConectionRequestReminder = inngest.createFunction(
  { id: "send-new-conection-request-reminder" },
  { event: "app/connection-request" },
  async({event, step}) => {
    const {connectionId} = event.data;

    await step.run('send-connection-request-mail', async () => {
      const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
      const subject = `👋🏻 New Connection Request`;
      const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
                      <h2>Hi ${connection.to_user_id.full_name},</h2>
                      <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
                      <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a> to accept or reject the request</p>
                      <br />
                      <p>Thanks,<br />Vible - Stay Connected</p>
                    </div>`;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body
      })
    })

    // Reminder email after 24 hours
    const in24hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24hours);
    await step.run('send-connection-request-reminder', async () => {
      const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');

      if(connection.status === 'accepted'){
        return {message: 'Already accepted'};
      }

      const subject = `👋🏻 New Connection Request`;
      const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
                      <h2>Hi ${connection.to_user_id.full_name},</h2>
                      <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
                      <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a> to accept or reject the request</p>
                      <br />
                      <p>Thanks,<br />Vible - Stay Connected</p>
                    </div>`;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body
      })

      return {message: 'Reminder sent.'}
    })
  }
)

// Injest to delete story after 24 hours
const deleteStory = inngest.createFunction(
  { id: "story-delete" },
  { event: "app/story.delete" },

  async ({event, step}) => {
    const {storyId} = event.data;
    const in24hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil('wait-for-24-hours', in24hours);
    await step.run("delete-story", async () => {
      await Story.findByIdAndDelete(storyId)
      return {message: "Story deleted."} 
    })
  }
)

// Injest send notification of unseen messages
const sendNotificationOfUnseenMessages = inngest.createFunction(
  { id: "send-unseen-messages-notification" },
  { cron: "TZ=America/New_York 0 9 * * *" }, // every day 9 am

  async ({step}) => {
    const messages = await Message.find({seen: false}).populate('to_user_id');
    const unseenCount = {};

    messages.map(message => {
      unseenCount[message.to_user_id._id] = (unseenCount[message.to_user_id._id] || 0) + 1;
    })

    for(const userId in unseenCount){
        const user = await User.findById(userId);

        const subject = `📬 You have ${unseenCount[userId]} unseen messages`;
        const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
                      <h2>Hi ${user.full_name},</h2>
                      <p>You have ${unseenCount[userId]} unseen messages</p>
                      <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a> to accept or reject the request</p>
                      <br />
                      <p>Thanks,<br />Vible - Stay Connected</p>
                    </div>`;

        await sendEmail({
          to: user.email,
          subject,
          body
        });

        return {message: "Notification sent."}
    }
  }
)

export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendConectionRequestReminder,
    deleteStory,
    sendNotificationOfUnseenMessages
];