import { UserButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import { LoadingSpinner, LoadingPage } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/layout";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
 
  const [ input, setInput] = useState<string>("");

  const ctx = api.useUtils();
  const {mutate, isLoading: isPosting} = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.post.getAll.invalidate();
    },

    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
      toast.error("Failed to post! Please try again later.");
      }
    },
  });
  if (!user) return null;

  return (
    <>
    {/* <Image 
      src={user.imageUrl} 
      className="w-14 h-14 rounded-full" 
      alt="Profile Picture"
      width={56}
      height={56} /> */}
      <div className="flex flex-grow">
        <input placeholder="Type some emojis!" 
        className="min-w-0 flex-grow bg-transparent outline-none" 
        style={{ minWidth: '150px' }}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
        />
        {input !== "" && !isPosting && (
          <button onClick={() => mutate({ content: input })} disabled={isPosting}>
            Post
            </button>
        )}
        {isPosting && (
        <div className="flex items-center justify-center">
        <LoadingSpinner size={20} />
        </div>
        )}
      </div>
      </>
  );
};

type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  const defaultImageUrl = "/public/blank_profile_image.pdf";

  return (

    <div key={post.id} className="flex border-b border-slate-400 p-4 gap-3">
      <Image 
      src={author?.profileImageUrl || defaultImageUrl} 
      className="w-14 h-14 rounded-full"
      alt={`@${author?.username}`}
      width={56}
      height={56}
       />
      <div className="flex flex-col">
        <div className="flex text-slate-300 gap-1">

          <Link href={`/@${author?.username}`}>
            <span>{`@${author?.username}`}</span>
          </Link>
          
          <Link href={`/post/${post.id}`}>
          <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
        </div>
      <span className="text-2xl">{post.content}</span>
      </div>
    </div>

  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.post.getAll.useQuery();

  if (postsLoading) return <LoadingPage />

  if (!data) return <div>Something went wrong</div>

  return (
    <div className="flex flex-col">
            {data?.map((fullPost) => (
          <PostView {...fullPost} key={fullPost.post.id}/>
          ))}
          </div>
  );
}

export default function Home() {
  // const hello = api.post.hello.useQuery({ text: "from tRPC" });
  const {isLoaded: userLoaded, isSignedIn}  = useUser();

  // start fetching asap
  api.post.getAll.useQuery();

  // This will return empty div if user isn't loaded yet
  if (!userLoaded) return <div />;



  return (
    <>
      <PageLayout>
        <header className="flex w-full gap-3 border-b border-slate-400 p-4">
          {!isSignedIn && (
            <>
          <div className="flex justify-center">
            <UserButton />
              </div>
              <div><span>Sign in to post</span></div>
              </>
            )}
          {isSignedIn && (
            <>
            <div className="flex justify-center">
            <UserButton />
              </div>
              <CreatePostWizard />
              </>
            )}
        </header>
        <Feed />
      </PageLayout>
    </>
  );
}
