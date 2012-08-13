//*********************************************************
//
//    Copyright (c) Microsoft. All rights reserved.
//    This code is licensed under the Microsoft Public License.
//    THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF
//    ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY
//    IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR
//    PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.
//
//*********************************************************

namespace PFCarrera.services.DataServiceProvider
{
    using System;
    using System.Collections.Generic;
    using System.Data.Services.Providers;
    using System.Linq;
    using System.Reflection;

    /// <summary>Metadata definition for the DSP. This also implements the <see cref="IDataServiceMetadataProvider"/>.</summary>
    public class DSPMetadata : IDataServiceMetadataProvider
    {
        /// <summary>List of resource sets. Dictionary where key is the name of the resource set and value is the resource set itself.</summary>
        /// <remarks>Note that we store this such that we can quickly lookup a resource set based on its name.</remarks>
        private Dictionary<string, ResourceSet> resourceSets;

        /// <summary>List of resource types. Dictionary where key is the full name of the resource type and value is the resource type itself.</summary>
        /// <remarks>Note that we store this such that we can quickly lookup a resource type based on its name.</remarks>
        private Dictionary<string, ResourceType> resourceTypes;

        /// <summary>Name of the container to report.</summary>
        private string containerName;

        /// <summary>Namespace name.</summary>
        private string namespaceName;

        /// <summary>Creates new empty metadata definition.</summary>
        /// <param name="containerName">Name of the container to report.</param>
        /// <param name="namespaceName">Namespace name.</param>
        public DSPMetadata(string containerName, string namespaceName)
        {
            this.resourceSets = new Dictionary<string, ResourceSet>();
            this.resourceTypes = new Dictionary<string, ResourceType>();
            this.containerName = containerName;
            this.namespaceName = namespaceName;
        }

        /// <summary>Adds a new entity type (without any properties).</summary>
        /// <param name="instanceType">The type of an entity instance.</param>
        /// <returns>The newly created resource type.</returns>
        /// <remarks>The name of the new type is the name of the <paramref name="instanceType"/>.</remarks>
        public ResourceType AddEntityType(Type instanceType)
        {
            return AddEntityType(instanceType, instanceType.Name);
        }

        /// <summary>Adds a new entity type (without any properties).</summary>
        /// <param name="instanceType">The type of an entity instance.</param>
        /// <param name="name">The name of the type.</param>
        /// <returns>The newly created resource type.</returns>
        public ResourceType AddEntityType(Type instanceType, string name)
        {
            // Due to our simplisitc way of telling the resource type from object's instance type
            //   we can't support multiple resource types with the same instance type.
            if (this.resourceTypes.Values.Any(rt => rt.InstanceType == instanceType))
            {
                throw new NotSupportedException("Multiple resource types with the same instance type are not supported.");
            }

            ResourceType resourceType = new ResourceType(instanceType, ResourceTypeKind.EntityType, null, this.namespaceName, name, false);
            resourceType.CanReflectOnInstanceType = true;
            resourceType.CustomState = new ResourceTypeAnnotation();
            this.resourceTypes.Add(resourceType.FullName, resourceType);
            return resourceType;
        }

        /// <summary>Adds a new complex type (without any properties).</summary>
        /// <param name="instanceType">The type of an instance of the complex type.</param>
        /// <returns>The newly created resource type.</returns>
        /// <remarks>The name of the new type is the name of the <paramref name="instanceType"/>.</remarks>
        public ResourceType AddComplexType(Type instanceType)
        {
            return AddComplexType(instanceType, instanceType.Name);
        }

        /// <summary>Adds a new complex type (without any properties).</summary>
        /// <param name="instanceType">The type of an instance of the complex type.</param>
        /// <param name="name">The name of the type.</param>
        /// <returns>The newly created resource type.</returns>
        public ResourceType AddComplexType(Type instanceType, string name)
        {
            // Due to our simplisitc way of telling the resource type from object's instance type
            //   we can't support multiple resource types with the same instance type.
            if (this.resourceTypes.Values.Any(rt => rt.InstanceType == instanceType))
            {
                throw new NotSupportedException("Multiple resource types with the same instance type are not supported.");
            }

            ResourceType resourceType = new ResourceType(instanceType, ResourceTypeKind.ComplexType, null, this.namespaceName, name, false);
            resourceType.CanReflectOnInstanceType = true;
            this.resourceTypes.Add(resourceType.FullName, resourceType);
            return resourceType;
        }

        /// <summary>Adds a key property to the specified <paramref name="resourceType"/>.</summary>
        /// <param name="resourceType">The resource type to add the property to.</param>
        /// <param name="name">The name of the property to add.</param>
        public void AddKeyProperty(ResourceType resourceType, string name)
        {
            this.AddPrimitiveProperty(resourceType, name, true);
        }

        /// <summary>Adds a primitive property to the specified <paramref name="resourceType"/>.</summary>
        /// <param name="resourceType">The resource type to add the property to.</param>
        /// <param name="name">The name of the property to add.</param>
        public void AddPrimitiveProperty(ResourceType resourceType, string name)
        {
            this.AddPrimitiveProperty(resourceType, name, false);
        }

        /// <summary>Adds a key property to the specified <paramref name="resourceType"/>.</summary>
        /// <param name="resourceType">The resource type to add the property to.</param>
        /// <param name="name">The name of the property to add.</param>
        /// <param name="typeName">The CLR type of the property to add. This can be only a primitive type.</param>
        /// <param name="isKey">true if the property should be a key property.</param>
        private void AddPrimitiveProperty(ResourceType resourceType, string name, bool isKey)
        {
            PropertyInfo propertyInfo = resourceType.InstanceType.GetProperty(name, BindingFlags.Public | BindingFlags.Instance);
            if (propertyInfo == null)
            {
                throw new ArgumentException("Can't add a property which does not exist on the instance type.");
            }

            ResourceType type = ResourceType.GetPrimitiveResourceType(propertyInfo.PropertyType);
            ResourcePropertyKind kind = ResourcePropertyKind.Primitive;
            if (isKey)
            {
                kind |= ResourcePropertyKind.Key;
            }

            ResourceProperty property = new ResourceProperty(propertyInfo.Name, kind, type);
            property.CanReflectOnInstanceTypeProperty = true;
            property.CustomState = new ResourcePropertyAnnotation() { InstanceProperty = propertyInfo };
            resourceType.AddProperty(property);
        }

        /// <summary>Adds a complex property to the specified <paramref name="resourceType"/>.</summary>
        /// <param name="resourceType">The resource type to add the property to.</param>
        /// <param name="name">The name of the property to add.</param>
        /// <param name="complexType">Complex type to use for the property.</param>
        public void AddComplexProperty(ResourceType resourceType, string name, ResourceType complexType)
        {
            if (complexType.ResourceTypeKind != ResourceTypeKind.ComplexType)
            {
                throw new ArgumentException("The specified type for the complex property is not a complex type.");
            }

            PropertyInfo propertyInfo = resourceType.InstanceType.GetProperty(name, BindingFlags.Public | BindingFlags.Instance);
            if (propertyInfo == null)
            {
                throw new ArgumentException("Can't add a property which does not exist on the instance type.");
            }

            if (propertyInfo.PropertyType != complexType.InstanceType)
            {
                throw new ArgumentException("The resource type for the complex property doesn't match the instance type of the property.");
            }

            ResourceProperty property = new ResourceProperty(name, ResourcePropertyKind.ComplexType, complexType);
            property.CanReflectOnInstanceTypeProperty = true;
            property.CustomState = new ResourcePropertyAnnotation() { InstanceProperty = propertyInfo };
            resourceType.AddProperty(property);
        }

        /// <summary>Adds a resource set to the metadata definition.</summary>
        /// <param name="name">The name of the resource set to add.</param>
        /// <param name="entityType">The type of entities in the resource set.</param>
        /// <returns>The newly created resource set.</returns>
        public ResourceSet AddResourceSet(string name, ResourceType entityType)
        {
            if (entityType.ResourceTypeKind != ResourceTypeKind.EntityType)
            {
                throw new ArgumentException("The resource type specified as the base type of a resource set is not an entity type.");
            }

            ResourceSet resourceSet = new ResourceSet(name, entityType);
            entityType.GetAnnotation().ResourceSet = resourceSet;
            this.resourceSets.Add(name, resourceSet);
            return resourceSet;
        }

        /// <summary>Marks the metadata as read-only.</summary>
        internal void SetReadOnly()
        {
            foreach (var type in this.resourceTypes.Values)
            {
                type.SetReadOnly();
            }

            foreach (var set in this.resourceSets.Values)
            {
                set.SetReadOnly();
            }
        }

        #region IDataServiceMetadataProvider Members

        /// <summary>Returns the name of the container. This value is used for example when a proxy is generated by VS through Add Service Reference.
        /// The main context class generated will have the ContainerName.</summary>
        public string ContainerName
        {
            get { return this.containerName; }
        }

        /// <summary>The namespace name for the container. This is used in the $metadata response.</summary>
        public string ContainerNamespace
        {
            get { return this.namespaceName; }
        }

        /// <summary>Returns list of all types derived (directly or indirectly) from the specified <see cref="resourceType"/>.</summary>
        /// <param name="resourceType">The resource type to determine derived types for.</param>
        /// <returns>List of derived types.</returns>
        /// <remarks>Note that this method will get called even if the HasDerivedTypes returns false.
        /// The implementation should be reasonably fast as it can be called to process a query request. (Aside from being called for the $metadata processing).</remarks>
        public System.Collections.Generic.IEnumerable<ResourceType> GetDerivedTypes(ResourceType resourceType)
        {
            // We don't support type inheritance yet
            return new ResourceType[0];
        }

        /// <summary>
        /// Gets the ResourceAssociationSet instance when given the source association end.
        /// </summary>
        /// <param name="resourceSet">Resource set of the source association end.</param>
        /// <param name="resourceType">Resource type of the source association end.</param>
        /// <param name="resourceProperty">Resource property of the source association end.</param>
        /// <returns>ResourceAssociationSet instance.</returns>
        public ResourceAssociationSet GetResourceAssociationSet(ResourceSet resourceSet, ResourceType resourceType, ResourceProperty resourceProperty)
        {
            throw new NotImplementedException("Should never get here, reference properties are not yet supported.");
        }

        /// <summary>Returns true if the specified type has some derived types.</summary>
        /// <param name="resourceType">The resource type to inspect.</param>
        /// <returns>true if the specified type has derived types.</returns>
        /// <remarks>The implementation should be fast as it will get called during normal request processing.</remarks>
        public bool HasDerivedTypes(ResourceType resourceType)
        {
            return false;
        }

        /// <summary>Returns all resource sets.</summary>
        /// <remarks>The implementation doesn't need to be fast as this will only be called for the $metadata and service document requests.</remarks>
        public System.Collections.Generic.IEnumerable<ResourceSet> ResourceSets
        {
            get { return this.resourceSets.Values; }
        }

        /// <summary>Returns all service operations.</summary>
        /// <remarks>The implementation doesn't need to be fast as this will only be called for the $metadata requests.</remarks>
        public System.Collections.Generic.IEnumerable<ServiceOperation> ServiceOperations
        {
            get { return new ServiceOperation[0]; }
        }

        /// <summary>Returnes a resource set specified by its name.</summary>
        /// <param name="name">The name of the resource set find.</param>
        /// <param name="resourceSet">The resource set instance found.</param>
        /// <returns>true if the resource set was found or false otherwise.</returns>
        /// <remarks>The implementation of this method should be very fast as it will get called for almost every request. It should also be fast
        /// for non-existing resource sets to avoid possible DoS attacks on the service.</remarks>
        public bool TryResolveResourceSet(string name, out ResourceSet resourceSet)
        {
            return this.resourceSets.TryGetValue(name, out resourceSet); ;
        }

        /// <summary>Returnes a resource type specified by its name.</summary>
        /// <param name="name">The full name of the resource type (including its namespace).</param>
        /// <param name="resourceType">The resource type instance found.</param>
        /// <returns>true if the resource type was found or false otherwise.</returns>
        /// <remarks>The implementation of this method should be very fast as it will get called for many requests. It should also be fast
        /// for non-existing resource types to avoid possible DoS attacks on the service.</remarks>
        public bool TryResolveResourceType(string name, out ResourceType resourceType)
        {
            return this.resourceTypes.TryGetValue(name, out resourceType);
        }

        /// <summary>Returns a service operation specified by its name.</summary>
        /// <param name="name">The name of the service operation to find.</param>
        /// <param name="serviceOperation">The service operation instance found.</param>
        /// <returns>true if the service operation was found or false otherwise.</returns>
        /// <remarks>The implementation of this method should be very fast as it will get called for many requests. It should also be fast
        /// for non-existing service operations to avoid possible DoS attacks on the service.</remarks>
        public bool TryResolveServiceOperation(string name, out ServiceOperation serviceOperation)
        {
            // No service operations are supported yet
            serviceOperation = null;
            return false;
        }

        /// <summary>Returns all resource types.</summary>
        /// <remarks>The implementation doesn't need to be fast as this will only be called for the $metadata requests.</remarks>
        public System.Collections.Generic.IEnumerable<ResourceType> Types
        {
            get { return this.resourceTypes.Values; }
        }

        #endregion
    }
}