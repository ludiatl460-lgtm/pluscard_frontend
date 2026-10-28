import {create} from "zustand";
import { getAllUsers, createUser, deleteUser, getUserById, updateUser } from "@/services/UserService";
import { User } from "@/types/User";

interface UserState {
   users: User[];
   loaoding: boolean;
   error: string | null;
   user: User | null
   getAllUsers: () => Promise<void>;
   getUserById: (id: string) =>Promise<void>;
   createUser: (user: User) => Promise<void>;
   updateUser: (id: string, user: User) => Promise<void>;
   deleteUser: (id: string) => Promise<void>;
}

export const UserStore = create<UserState>((set) =>( {
    users: [],
    loaoding: false,
    error: null,
    user: null,
    getAllUsers: async () =>{
      try {
         set({loaoding: true});
         const result: User[] = await getAllUsers();
         set({loaoding: false, users: result});
      } catch (e: any) {
         set({
            error: e,
            loaoding: false
         })
      }
    },
    getUserById: async(id: string) => {
         try {
         set({loaoding: true});
         const result: User = await getUserById(id);
         set({loaoding: false, user: result});
      } catch (e: any) {
         set({
            error: e,
            loaoding: false
         })
      }
    },
    createUser: async(user: User) => {
      try {
         const result: User = await createUser(user);
         set((state)=>({
            users: [...state.users, result]
         }))
      } catch (e: any) {
         set({error: e})
      }
    },
    updateUser: async(id: string, user:User) => {
         try {
            const updatedUser: User = await updateUser(id, user);
            set((state) => ({
               users: state.users.map((item) => item.id === id ? updatedUser : item)
            }))    
         } catch (e: any) {
            set({error: e})
         }
    },
    deleteUser: async(id: string) => {
         try {
             await deleteUser(id);
             set((state)=> ({
                  users: state.users.filter((item) => item.id !== id)
             }))     
         } catch (e: any) {
             set({error: e}); 
         }
    }
}))