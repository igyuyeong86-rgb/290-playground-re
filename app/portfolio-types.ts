export type Profile={name:string;headline:string;about:string};
export type Post={id:string;title:string;category:'study'|'project'|'note';excerpt:string;body?:string;created:number};
export type PortfolioData={profile:Profile;posts:Post[]};
export const emptyProfile:Profile={name:'',headline:'',about:''};
export const emptyPost:Omit<Post,'id'|'created'>={title:'',category:'note',excerpt:'',body:''};
export const categoryLabel={study:'Study',project:'Projects',note:'Writing'} as const;
