import { UserButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { LoadingPage } from "~/components/loading";
import { api } from "~/utils/api";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import type { GetStaticProps, GetStaticPaths } from "next";
import { PageLayout } from "~/components/layout";

type ProfilePageProps = {
  username: string;
};

const ProfilePage = ({ username }: ProfilePageProps) =>{


  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;
  
  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <img src={data.profileImageUrl} 
          alt={`${data.username ?? ""}'s profile pic`}
          width={128}
          height={128}
          className=" absolute bottom-0 left-0 -mb-[64px] rounded-full border-4 border-black bg-black ml-4" />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl">{`@${data.username  ?? ""}`}</div>
        <div className="w-full border-b border-slate-400" />
      </PageLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};
export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;