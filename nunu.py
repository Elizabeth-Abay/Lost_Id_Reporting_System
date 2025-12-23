# print("hello world")
# print("*"*10)
# first="Tsion"
# last="kinde"
# full_name=first + " " + last
# print(full_name)
# print(full_name.upper())
# print(full_name.lower())
# print(full_name.title())#beteword mejemeriya yalutn capital yadergachewal
# print(full_name.strip())#yemejemeriya bcha nw space yalutn nachewal
# print(full_name.capitalize())#yemejemriyawn bcha nw capital miyadergew
# print(full_name.replace("kinde","kinde tsion"))#yemayadergew new yemayadergew yadergew
# def greet():
#     print("hello " + full_name.title())
# greet()
# #function that return a value
# def get_greet():
#     return "hello " + full_name.title() 
# message=get_greet()
# print(message) 
# def greet(name):
#     print(f"hello {name.title()}")
# print(greet("Tsion"))   #none milew default value of return nw b/c print blen function name mnasgebaw return value endinorew nw 
# def increment(number,by=1):
#     return number + by
# print(increment(5,2))#5+2=7
# print(increment(5))#5+1=6 by default 1 new

# def multiply (*numbers):
#     total=1
#     for number in numbers:
#         total *= number
#     return total
 
# print(multiply(2,3,4,5)  )
# def save_user(**user):
#     print(user)
#     #print(user["id"]) dictionary lay id key yadergew
# save_user(id=2656.16,name="Tsion",age=20)      #it will save as a dictionary
# message="tsi"
# def greet(name):
#     global message
#     message="nunu"
# greet("tsion")    
# print(message)   
# def fizz_buzz(number):
#     if number % 3 == 0 and number % 5 == 0:
#         return "fizz buzz"
#     if number % 3 == 0:
#         return "fizz"
#     if number % 5 == 0:
#         return "buzz"
#     return str(number)
    
# Read n and t from input
# n,t=map(int,input().split())
# s=input()

# def arrangeQueue(n,t,s):
#     queue=list(s)
#     for _ in range(t):
#         i=0
#         while i<n-1:
#             if queue[i]=="B" and queue[i+1]=="G":
#                 queue[i],queue[i+1]=queue[i+1],queue[i]
#                 i+=1
#             i+=1
#         return ''.join(queue)   
# result= arrangeQueue(n,t,s)
# print(result)     
n,m=map(int,input().split())
for i in range(m):
    
