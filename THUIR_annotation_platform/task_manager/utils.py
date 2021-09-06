#!/usr/bin/env python
# -*- coding: utf-8 -*-
__author__ = 'defaultstr'

from .models import *
from user_system.models import *

try:
    import simplejson as json
except ImportError:
    import json
import time


def store_data(message):
    try:
        page_log = PageLog()
        user = User.objects.get(username=message['username'])
        page_log.user = user
        page_log.page_type = message['type']
        page_log.page_title = message['title']
        page_log.origin = message['origin']
        page_log.url = message['url']
        page_log.referrer = message['referrer']
        page_log.serp_link = message['serp_link']
        page_log.html = message['html']
        page_log.start_timestamp = int(message['start_timestamp'])
        page_log.end_timestamp = int(message['end_timestamp'])
        page_log.dwell_time = int(message['dwell_time'])
        page_log.page_timestamps = message['page_timestamps']
        page_log.query_string = message['query']
        page_log.mouse_moves = message['mouse_moves']
        page_log.clicked_results = message['clicked_results']
        page_log.clicked_others = message['clicked_others']  # x, y, time，content, href
        if message['page_id']:
            page_id = int(message['page_id'])
        else:
            page_id = 1
        page_log.page_id = page_id

        if message['type'] == 'SERP':
            if page_id == 1:
                preRate = int(message["preRate"])
                if preRate == 1:
                    if len(Query.objects.filter(user=user, start_timestamp=int(message['start_timestamp']))) != 0:
                        new_query = Query.objects.filter(user=user, start_timestamp=int(message['start_timestamp']))[0]
                        new_query.query_string = message['query']
                        new_query.interface = int(message['interface'])
                        new_query.life_start = int(time.time())
                        new_query.save()
                    else:
                        new_query = Query()
                        new_query.user = user
                        new_query.task_annotation = TaskAnnotation.objects.filter(annotation_status=True)[0]
                        new_query.partition_status = False
                        new_query.annotation_status = False
                        new_query.query_string = message['query']
                        new_query.start_timestamp = int(message['start_timestamp'])
                        new_query.interface = int(message['interface'])
                        new_query.life_start = int(time.time())
                        new_query.save()
                else:
                    new_query = Query()
                    new_query.user = user
                    new_query.task_annotation = TaskAnnotation.objects.filter(annotation_status=True)[0]
                    new_query.partition_status = False
                    new_query.annotation_status = False
                    new_query.query_string = message['query']
                    new_query.start_timestamp = int(message['start_timestamp'])
                    new_query.interface = int(message['interface'])
                    new_query.life_start = int(time.time())
                    new_query.save()
                page_log.belong_query = new_query
            else:
                nearest_log = sorted(PageLog.objects.filter(user=user, page_type='SERP', query_string=message['query']), key=lambda item: item.start_timestamp, reverse=True)[0]
                belong_query = nearest_log.belong_query
                belong_query.life_start = int(time.time())
                page_log.belong_query = belong_query
        else:
            page_log.belong_query = Query.objects.filter(annotation_status=True)[0]
        if not message['url'].startswith(f'{ip_to_launch}'):   # ip_to_launch should be set manually
            page_log.save()
    except Exception as e:
        print ('exception', e)


def store_page_annotation(message, page_id):
    try:
        usefulness_list = message.split('#')[0].split('\t')
        if message.split('#')[1] == '':
            serendipity_list = []
        else:
            serendipity_list = message.split('#')[1].split(',')
        all_results = usefulness_list[0].split(',') + usefulness_list[1].split(',') + usefulness_list[2].split(',')
        non_serendipity = set(all_results).difference(set(serendipity_list))
        non_serendipity.discard("")
        non_serendipity = list(non_serendipity)
        page_log = PageLog.objects.get(id=page_id)
        serp_annotations = SERPAnnotation.objects.filter(serp_log=page_log)
        if serp_annotations:
            serp_annotation = serp_annotations[0]
            serp_annotation.usefulness_0 = usefulness_list[0]
            serp_annotation.usefulness_1 = usefulness_list[1]
            serp_annotation.usefulness_2 = usefulness_list[2]
            serp_annotation.serendipity_0 = ','.join(non_serendipity)
            serp_annotation.serendipity_1 = ','.join(serendipity_list)
        else:
            serp_annotation = SERPAnnotation()
            serp_annotation.serp_log = page_log
            serp_annotation.usefulness_0 = usefulness_list[0]
            serp_annotation.usefulness_1 = usefulness_list[1]
            serp_annotation.usefulness_2 = usefulness_list[2]
            serp_annotation.serendipity_0 = ','.join(non_serendipity)
            serp_annotation.serendipity_1 = ','.join(serendipity_list)
        serp_annotation.save()
    except Exception as e:
        print ('exception', e)


def partition(user, query_ids):
    task = TaskAnnotation()
    task.user = user
    task.annotation_status = False
    task.save()
    for query_id in query_ids:
        query_id = int(query_id)
        query = Query.objects.get(id=query_id)
        query.partition_status = True
        query.task_annotation = task
        query.save()
        query__annotation = QueryAnnotation()
        query__annotation.belong_query = query

        query__annotation.relation = -1
        query__annotation.inspiration = -1
        query__annotation.satisfaction = -1
        query__annotation.ending_type = -1
        query__annotation.other_reason = ""
        query__annotation.other_relation = ""
        query__annotation.save()


def delete(user, query_ids):
    for query_id in query_ids:
        query_id = int(query_id)
        query = Query.objects.get(user=user, id=query_id)
        pagelogs = PageLog.objects.filter(user=user, belong_query=query)
        for pagelog in pagelogs:
            pagelog.delete()
        query.delete()


def unpartition(user, task_ids):
    for task_id in task_ids:
        task = TaskAnnotation.objects.get(user=user, id=task_id)
        queries = Query.objects.filter(user=user, partition_status=True, task_annotation=task)
        for query in queries:
            query.partition_status = False
            query.task_annotation = TaskAnnotation.objects.filter(annotation_status=True)[0]
            query.save()
            query_annotations = QueryAnnotation.objects.filter(belong_query=query)
            for query_annotation in query_annotations:
                query_annotation.delete()
            pagelogs = PageLog.objects.filter(user=user, belong_query=query)
            for pagelog in pagelogs:
                for serp_annotation in SERPAnnotation.objects.filter(serp_log=pagelog):
                        serp_annotation.delete()
        task.delete()


def clear_expired_query(user):
    unpartition_queries = Query.objects.filter(user=user, partition_status=False)
    for query in unpartition_queries:
        if int(time.time()) - query.life_start > 172800:
            pagelogs = PageLog.objects.filter(user=user, belong_query=query)
            for pagelog in pagelogs:
                pagelog.delete()
            query.delete()

    unannotated_tasks = TaskAnnotation.objects.filter(user=user, annotation_status=False)
    for task in unannotated_tasks:
        queries = Query.objects.filter(user=user, partition_status=True, task_annotation=task)
        expired = False
        for query in queries:
            if int(time.time()) - query.life_start > 172800:
                expired = True
                break
        if expired:
            for query in queries:
                for pagelog in PageLog.objects.filter(user=user, belong_query=query):
                    for serp_annotation in SERPAnnotation.objects.filter(serp_log=pagelog):
                        serp_annotation.delete()
                    pagelog.delete()
                query_annotations = QueryAnnotation.objects.filter(belong_query=query)
                for query_annotation in query_annotations:
                    query_annotation.delete()
                query.delete()
            task.delete()


def get_items_list(user, queries):
    items_list = []
    for i in range(len(queries)):
        query = queries[i]
        query__annotation = QueryAnnotation.objects.filter(belong_query=query)[0]
        pages = sorted(PageLog.objects.filter(user=user, belong_query=query, page_type='SERP'), key=lambda item: item.start_timestamp)
        pages_and_status = []
        for page in pages:
            if SERPAnnotation.objects.filter(serp_log=page):
                pages_and_status.append((page, True))
            else:
                pages_and_status.append((page, False))
        if i == 0:
            prequery = Query.objects.filter(life_start=0)[0]
        else:
            prequery = queries[i-1]
        items_list.append((query, prequery, query__annotation, pages_and_status))
    return items_list


def check_serp_annotations(user, queries):
    flag = True
    for query in queries:
        pages = sorted(PageLog.objects.filter(user=user, belong_query=query, page_type='SERP'), key=lambda item: item.start_timestamp)
        for page in pages:
            if not SERPAnnotation.objects.filter(serp_log=page):
                flag = False
                break
    return flag
