export interface User {
  email: string;
  token: string;
  username: string;
  bio: string;
  image: string;
}

export interface UserResponse {
  user: User;
}

export interface UserStatistics {
  userId: number;
  username: string;
  totalArticles: number;
  totalLikes: number;
  firstArticleDate: Date;
}

export type UserStatisticsResponse = UserStatistics[];
