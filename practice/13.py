# -*- coding: utf-8 -*-
from __future__ import unicode_literals

__author__ = 'fanglei.zhao'


class Solution(object):

    def find_target(self, nums, target):
        if len(nums) < 2:
            return []
        left = 0
        right = len(nums) - 1
        res = []
        while left < right:
            if nums[left] + nums[right] == target:
                res.append([-target, nums[left], nums[right]])
                left += 1
                right -= 1
            elif nums[left] + nums[right] > target:
                right -= 1
            else:
                left += 1
        return res

    def threeSum(self, nums):
        """
        :type nums: List[int]
        :rtype: List[List[int]]
        """
        if len(nums) < 3:
            return []
        nums.sort()
        res = []
        for i in xrange(len(nums)):
            res.extend(self.find_target(nums[i+1:], -nums[i]))

        ret_res = []
        for item in res:
            item.sort()
            ret_res.append(item)
        def cmp(a, b):
            if a[0] != b[0]:
                return a[0] - b[0]
            elif a[1] != b[1]:
                return a[1] - b[1]
            else:
                return a[2] - b[2]
        ret_res.sort(cmp=cmp)

        res = []
        for item in ret_res:
            if len(res) == 0:
                res.append(item)
            if item != res[-1]:
                res.append(item)
        return res


    def binarySearch(self, nums, x):
        if len(nums) <= 0:
            return -1
        l = len(nums)
        left = 0
        right = l - 1
        while left <= right:
            mid = (left + right) >> 1
            if nums[mid] == x:
                return mid
            elif nums[mid] < x:
                left = mid + 1
            else:
                right = mid - 1
        if left > right:
            return -1


s = Solution()
# print s.threeSum([-1, 0, 1, 2, -1, -4])
print s.threeSum([-13,5,13,12,-2,-11,-1,12,-3,0,-3,-7,-7,-5,-3,-15,-2,14,14,13,6,-11,-11,5,-15,-14,5,-5,-2,0,3,-8,-10,-7,11,-5,-10,-5,-7,-6,2,5,3,2,7,7,3,-10,-2,2,-12,-11,-1,14,10,-9,-15,-8,-7,-9,7,3,-2,5,11,-13,-15,8,-3,-7,-12,7,5,-2,-6,-3,-10,4,2,-5,14,-3,-1,-10,-3,-14,-4,-3,-7,-4,3,8,14,9,-2,10,11,-10,-4,-15,-9,-1,-1,3,4,1,8,1])
