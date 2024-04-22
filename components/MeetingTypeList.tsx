"use client";
import React from "react";
import Homecard from "./Homecard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MeetingModel from "./MeetingModel";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
// import { useToast } from "@/components/ui/use-toast"
// import { useToast } from './ui/use-toast'
import ReactDatePicker from "react-datepicker";
import { toast, useToast } from './ui/use-toast';
import { Input } from "./ui/input";

const MeetingTypeList = () => {
  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >();
  const router = useRouter();
  const { user } = useUser();
  const client = useStreamVideoClient();
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });
  const [callDetails, setcallDetails] = useState<Call>();
  // const {toast} = useToast();
  const createMeeting = async () => {
    // if(!values.dateTime){
    //   toast({title:"Please select a date and time"})
    //     return ;
    // }
    if (!client || !user) return;
    try {
      const id = crypto.randomUUID();
      const call = client.call("default", id);
      if (!call) throw new Error("Failed to create call ");
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || "Instant meeting";
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setcallDetails(call);
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      //  toast({title:"Meeting Created"}) ;
    } catch (error) {
      console.log(error);
      // toast({title: "failed to create meeting",})
    }
  };
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <Homecard
        img={"icons/add-meeting.svg"}
        title="New meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState("isInstantMeeting")}
        className="bg-orange-1"
      />
      <Homecard
        img={"icons/schedule.svg"}
        title="Schedule meeting"
        description="Plan your meeting"
        handleClick={() => setMeetingState("isScheduleMeeting")}
        className="bg-blue-1"
      />
      <Homecard
        img={"icons/recordings.svg"}
        title="View Recording"
        description="Check out your recording"
        handleClick={() => router.push("/recordings")}
        className="bg-purple-1"
      />
      <Homecard
        img={"icons/join-meeting.svg"}
        title="Join meeting"
        description="via invitation link"
        handleClick={() => setMeetingState("isJoiningMeeting")}
        className="bg-yellow-1"
      />
      {!callDetails ? (
        <MeetingModel
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-sky-2">
              Add a description
            </label>
            <textarea
              className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
            />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-sky-2">
              Select Date and Time
            </label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full rounded bg-dark-3 p-2 focus:outline-none"
            />

          </div>
        </MeetingModel>
      ) : (
        <MeetingModel
        isOpen={meetingState === 'isScheduleMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Meeting Created"
        handleClick={() => {
          navigator.clipboard.writeText(meetingLink);
          // toast({ title: 'Link Copied' });
          toast({ title: 'Link Copied' });
        }}
        image={'/icons/checked.svg'}
        buttonIcon="/icons/copy.svg"
        className="text-center"
        buttonText="Copy Meeting Link"
      />
      )}
      <MeetingModel
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => {
          setMeetingState(undefined);
        }}
        title="Start an Instant meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />

<MeetingModel
        isOpen={meetingState === "isJoiningMeeting"}
        onClose={() => {
          setMeetingState(undefined);
        }}
        title="Type the link  here "
        className="text-center"
        buttonText="Join Meeting"
        handleClick={()=>{router.push(values.link)}}
      >
        <Input placeholder="Meeting link" 
        className=" border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
        onChange={(e)=> setValues({...values,link:e.target.value})}
        />
      </MeetingModel>
    </section>
  );
};

export default MeetingTypeList;
