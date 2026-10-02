# graph repo test-fetching immediate neighbors of a node
# 
# from repositories.graph_repository import GraphRepository

# repo = GraphRepository()

# rows = repo.get_immediate_neighbors("FL:BOKOR")

# for row in rows:
#     print(row)

# repo.close()


from services.graph_services import GraphService

service = GraphService()

graph = service.get_initial_graph()

print(graph)

service.close()