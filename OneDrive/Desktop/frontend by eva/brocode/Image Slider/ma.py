# for i in range(5):
#     print((i+1)*'*')
# def gcf(a, b):
#     while b:
#         a, b = b, a % b#divides until a%b become zero and when it become 0 it returns a value b/c while 0==false and return a
#     return a

# # Example usage
# result = gcf(2, 4)
# print("The GCF is", result)
# word=input()
# rev_word=input()
# if word==rev_word[::-1]:
#     print("YES")
# else:
#     print("NO")    
# n=int(input())
# num=map(int,input().split())
# for i in num:
# def fn(a):
   
#     if a[0]==a[1]+a[2] or a[1]==a[0]+a[2] or a[2]==a[0]+a[1]:
#         print("YES")
#     else:
#         print("NO")   
# t=int(input())
# for _ in range(t):
#     a=list(map(int,input().split()))
#     fn(a)     
# 
# n=int(input())
# a=a=list(map(int,input().split()))
# sum=0
# for i in a:
#     sum+=i
# result=sum/n    
# print(result)
# n=int(input())
# a=list(map(int,input().split()))
# mymax=max(a)
# total=0
# for i in range(len(a)):
#     total+=mymax-a[i]
# print(total)    
# n=int(input())
# for i in range(n):
#     word=input()
#     word=word.replace('us','i')
#     print(word)    
# def fn(a):
#     for i in range(len(a)):
#         if a[0]!=a[i]:
#             print("NO")
#             return

#     print("YES")
# t=int(input())
# for _ in range(t):
#     a=list(map(int,input().split()))
#     fn(a)
         
# def fn(a):
#     result=0
#     for i in range(1,a+1):
#         if i%2==1:
#             result-=i
#         else:
#             result+=i
#     return result
# a=int(input())
# print(fn(a))
# shops=int(input())
# priceofdrinks=list(map(int,input().split())) 
# noofdays=int(input())  
# for _ in range(noofdays):
#     coinscanspent=int(input())  
#     count=0 
#     for i in priceofdrinks:
#         if i<=  coinscanspent:
#             count+=1
#     print(count)      
# word=input()
# if word==word[::-1]:
#     print("NO") 
# else:
#     print("YES")   
# two screens          
# t=int(input())
# for _ in range(t):
#     word1=input().strip()
#     word2=input().strip()
#     i=0
#     while i < len(word1) and i < len(word2) and word1[i] == word2[i]:
#         i+=1
#     result=len(word1)+len(word2)-i
#     if i>0:
#         result+=1

#     print(result)
# Alice Bob and Chocolate
# n=int(input())
# choco=list(map(int,input().split()))
# a,b=0,0
# for i in range(len(choco)):
#     if i%2==0:
#         a+=1
#     else:
#         b+=1
# print(b,a)            

# eating candies
# t=int(input())
# for _ in range(t):
#     n=int(input())
#     weightofCandies=list(map(int,input().split()))
#     l,r=0,n-1
#     a=0
#     b=0
#     count=0
#     while l<=r:
#         if a<=b:
#             a+=weightofCandies[l]
#             l+=1
#         else:
#               b+=weightofCandies[r]
#               r-=1
#         count+=1  
#     print(count)    
# n,m=map(int,input().split())
# nums=list(map(int,input().split()))
# nums.sort()
# ans=float('inf')

# for i in range(m-n+1):
#     diff=nums[i+n-1]-nums[i]
#     ans=min(ans,diff)
   

# print(ans)    
# n=int(input())
# x=list(map(int,input().split()))
# y=list(map(int,input().split()))
# the_whole=set(range(1,n+1))
# x=x[1:]
# y=y[1:]

# z=set(x).union(set(y))
# if z==the_whole :
#     print("I become the guy.")  
# else:
#     print("Oh, my keyboard!")  
# n=int(input())
# for i in range(n):
#     x=list(map(int,input().split()))  

#     for i in range(1,len(x)-1):
#         if x[i]+x[i+1]==x[i-1] or x[i+1]+x[i-1]==x[i] or x[i]+x[i-1]==x[i+1]:
#             print("YES")
#         else:
#             print("NO")    
n=int(input())
for _ in range(n):
    num=input()
   
    length=len(num)
    half=length//2
    left_half=sum(int(d) for d in num[:half])
    right_half=sum(int(d) for d in num[half:])
    if  left_half==right_half:
        print("YES")
    else:
        print("NO")    




      
      
    

    




            
            
            

            

   






    
    
          

