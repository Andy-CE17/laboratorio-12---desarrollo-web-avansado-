import AuthorDetail from "@/components/author-detail";

export default async function Page({params}:{params:Promise<{id:string}>}) {
  return <AuthorDetail id={(await params).id}/>;
}
